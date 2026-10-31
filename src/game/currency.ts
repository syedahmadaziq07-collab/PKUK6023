/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Banknote, CurrencyDenomination } from '../types/game';

export const MALAYSIAN_BANKNOTES: Record<CurrencyDenomination, Banknote> = {
  1: {
    id: 'rm1',
    value: 1,
    name: 'Satu Ringgit',
    colorName: 'Biru',
    primaryColor: '#2563eb', // Royal Blue
    accentColor: '#93c5fd',
    motif: 'Wau Bulan',
    frontNumber: '1',
  },
  5: {
    id: 'rm5',
    value: 5,
    name: 'Lima Ringgit',
    colorName: 'Hijau',
    primaryColor: '#16a34a', // Emerald Green
    accentColor: '#86efac',
    motif: 'Burung Enggang Badak',
    frontNumber: '5',
  },
  10: {
    id: 'rm10',
    value: 10,
    name: 'Sepuluh Ringgit',
    colorName: 'Merah',
    primaryColor: '#dc2626', // Vibrant Red
    accentColor: '#fca5a5',
    motif: 'Bunga Rafflesia',
    frontNumber: '10',
  },
};

/**
 * Converts sen (integer) to Ringgit representation string.
 * e.g., 200 -> "RM2", 1500 -> "RM15", 50 -> "50 sen"
 */
export function senToRinggitString(sen: number): string {
  if (sen <= 0) return 'RM0';
  if (sen % 100 === 0) {
    return `RM${sen / 100}`;
  }
  return `RM${(sen / 100).toFixed(2)}`;
}

/**
 * Calculate total value in sen from an array of Malaysian banknotes
 */
export function calculateTotalSen(notes: CurrencyDenomination[]): number {
  return notes.reduce((sum, denom) => sum + denom * 100, 0);
}

/**
 * Generates an accessible equation string.
 * e.g., [1, 1] => "RM1 + RM1 = RM2"
 * e.g., [5] => "RM5"
 * e.g., [] => "RM0"
 */
export function formatNotesFormula(notes: CurrencyDenomination[]): string {
  if (!notes || notes.length === 0) return 'RM0';
  const total = calculateTotalSen(notes);
  const parts = notes.map((n) => `RM${n}`);
  if (notes.length === 1) {
    return parts[0];
  }
  return `${parts.join(' + ')} = ${senToRinggitString(total)}`;
}

export interface PaymentValidationResult {
  valid: boolean;
  differenceSen: number;
  message: string;
  isExact: boolean;
  isOver: boolean;
  isUnder: boolean;
  changeSen: number;
}

/**
 * Validates a payment attempt against target price in sen.
 * In Kedai Mini Bijak educational setting, exact payment or sufficient payment with valid change is checked.
 * For primary MBPK learners, exact payment reinforces foundational 1-to-1 matching.
 */
export function validatePayment(
  notes: CurrencyDenomination[],
  targetTotalSen: number,
  requireExact: boolean = true
): PaymentValidationResult {
  const paidSen = calculateTotalSen(notes);
  const diff = paidSen - targetTotalSen;

  if (diff === 0) {
    return {
      valid: true,
      differenceSen: 0,
      message: 'Tahniah! Bayaran kamu tepat dan betul!',
      isExact: true,
      isOver: false,
      isUnder: false,
      changeSen: 0,
    };
  }

  if (diff < 0) {
    const remainingSen = Math.abs(diff);
    return {
      valid: false,
      differenceSen: diff,
      message: `Wang belum cukup. Kamu perlu tambah lagi ${senToRinggitString(remainingSen)}.`,
      isExact: false,
      isOver: false,
      isUnder: true,
      changeSen: 0,
    };
  }

  // Over payment
  if (requireExact) {
    return {
      valid: false,
      differenceSen: diff,
      message: `Wang terlebih ${senToRinggitString(diff)}. Sila bayar jumlah tepat ${senToRinggitString(targetTotalSen)}.`,
      isExact: false,
      isOver: true,
      isUnder: false,
      changeSen: diff,
    };
  }

  return {
    valid: true,
    differenceSen: diff,
    message: `Bayaran diterima! Baki wang kamu ialah ${senToRinggitString(diff)}.`,
    isExact: false,
    isOver: true,
    isUnder: false,
    changeSen: diff,
  };
}

/**
 * Returns an optimal combination of notes to pay an exact amount in sen.
 */
export function getOptimalNotes(targetTotalSen: number): CurrencyDenomination[] {
  let remaining = Math.floor(targetTotalSen / 100);
  const result: CurrencyDenomination[] = [];

  while (remaining >= 10) {
    result.push(10);
    remaining -= 10;
  }
  while (remaining >= 5) {
    result.push(5);
    remaining -= 5;
  }
  while (remaining >= 1) {
    result.push(1);
    remaining -= 1;
  }

  return result;
}

/**
 * Returns accessible friendly spoken text in Bahasa Melayu for banknotes
 */
export function getBanknoteSpokenName(value: CurrencyDenomination): string {
  switch (value) {
    case 1:
      return 'Satu ringgit, wang berwarna biru';
    case 5:
      return 'Lima ringgit, wang berwarna hijau';
    case 10:
      return 'Sepuluh ringgit, wang berwarna merah';
    default:
      return `${value} ringgit`;
  }
}
