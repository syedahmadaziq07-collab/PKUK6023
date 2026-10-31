/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlayerStats, MissionProgress, GameSettings } from '../types/game';
import { INITIAL_MISSIONS } from './missions';

const STORAGE_KEYS = {
  STATS: 'kmb_player_stats_v1',
  MISSIONS: 'kmb_missions_v1',
  SETTINGS: 'kmb_settings_v1',
};

export const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  voiceEnabled: true,
  volume: 0.7,
  lookSensitivity: 1.0,
  reducedMotion: false,
  highContrast: false,
  showControlGuides: true,
};

export const DEFAULT_STATS: PlayerStats = {
  totalStars: 0,
  totalPurchases: 0,
  correctAnswersFirstTry: 0,
  totalAttempts: 0,
  hintsUsedCount: 0,
  missionsCompleted: [],
  purchaseHistory: [],
  assessmentScores: {},
};

export function loadSettings(): GameSettings {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch {
    // fallback
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: GameSettings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function loadMissions(): MissionProgress[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MISSIONS);
    if (data) return JSON.parse(data);
  } catch {
    // fallback
  }
  return INITIAL_MISSIONS;
}

export function saveMissions(missions: MissionProgress[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(missions));
  } catch {
    // ignore
  }
}

export function loadPlayerStats(): PlayerStats {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STATS);
    if (data) return { ...DEFAULT_STATS, ...JSON.parse(data) };
  } catch {
    // fallback
  }
  return DEFAULT_STATS;
}

export function savePlayerStats(stats: PlayerStats) {
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch {
    // ignore
  }
}

export function resetAllData() {
  try {
    localStorage.removeItem(STORAGE_KEYS.STATS);
    localStorage.removeItem(STORAGE_KEYS.MISSIONS);
  } catch {
    // ignore
  }
}

/**
 * Generates and triggers download of an educational CSV summary for teachers
 */
export function exportTeacherReportCSV(stats: PlayerStats, missions: MissionProgress[]) {
  const accuracy =
    stats.totalAttempts > 0
      ? ((stats.correctAnswersFirstTry / stats.totalAttempts) * 100).toFixed(1)
      : '0.0';

  const rows: string[][] = [
    ['LAPORAN PRESTASI PEMBELAJARAN - KEDAI MINI BIJAK'],
    ['Tarikh Laporan', new Date().toLocaleDateString('ms-MY')],
    ['Masa', new Date().toLocaleTimeString('ms-MY')],
    [''],
    ['--- RINGKASAN PRESTASI MURID ---'],
    ['Jumlah Bintang Dikumpul', `${stats.totalStars} / 9`],
    ['Jumlah Pembelian Berjaya', `${stats.totalPurchases}`],
    ['Ketepatan Percubaan Pertama', `${accuracy}% (${stats.correctAnswersFirstTry}/${stats.totalAttempts})`],
    ['Jumlah Percubaan Semula', `${stats.totalAttempts - stats.correctAnswersFirstTry}`],
    ['Bantuan / Petunjuk Digunakan', `${stats.hintsUsedCount}`],
    [''],
    ['--- KEMAJUAN MISI ---'],
    ['ID Misi', 'Nama Misi', 'Status', 'Bintang'],
    ...missions.map((m) => [
      m.id,
      m.title,
      m.completed ? 'Selesai' : 'Belum Selesai',
      `${m.stars} Bintang`,
    ]),
    [''],
    ['--- PENILAIAN MBPK ---'],
    [
      'Penilaian Awal (Pre-Test)',
      stats.assessmentScores.preTest
        ? `${stats.assessmentScores.preTest.score} / ${stats.assessmentScores.preTest.total} (${stats.assessmentScores.preTest.date})`
        : 'Belum Diduduki',
    ],
    [
      'Penilaian Akhir (Post-Test)',
      stats.assessmentScores.postTest
        ? `${stats.assessmentScores.postTest.score} / ${stats.assessmentScores.postTest.total} (${stats.assessmentScores.postTest.date})`
        : 'Belum Diduduki',
    ],
    [''],
    ['--- REKOD TRANSAKSI PEMBELIAN ---'],
    ['Barang Dibeli', 'Harga (Sen)', 'Bayaran Dibuat (Sen)', 'Bil. Percubaan', 'Masa Transaksi'],
    ...stats.purchaseHistory.map((p) => [
      p.itemName,
      p.priceSen.toString(),
      p.paidSen.toString(),
      p.attempts.toString(),
      p.timestamp,
    ]),
  ];

  const csvContent =
    'data:text/csv;charset=utf-8,\uFEFF' +
    rows.map((row) => row.map((val) => `"${val.replace(/"/g, '""')}"`).join(',')).join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Laporan_Kedai_Mini_Bijak_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
