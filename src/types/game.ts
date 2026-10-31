/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CurrencyDenomination = 1 | 5 | 10;

export interface Banknote {
  id: string;
  value: CurrencyDenomination;
  name: string;
  colorName: string;
  primaryColor: string;
  accentColor: string;
  motif: string;
  frontNumber: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'roti' | 'minuman' | 'alat_tulis' | 'buah';
  priceSen: number; // in sen (e.g. 200 sen = RM2)
  priceDisplay: string; // e.g. "RM2"
  description: string;
  shelfLocation: { x: number; y: number; z: number };
  color: string;
  secondaryColor?: string;
  modelType: 'bread' | 'milk' | 'water' | 'pencil' | 'notebook' | 'apple';
}

export type MissionId = 'mission_1' | 'mission_2' | 'mission_3';

export interface MissionProgress {
  id: MissionId;
  title: string;
  shortDesc: string;
  completed: boolean;
  stars: number; // 0 to 3
  bestScore: number;
}

export interface PlayerStats {
  totalStars: number;
  totalPurchases: number;
  correctAnswersFirstTry: number;
  totalAttempts: number;
  hintsUsedCount: number;
  missionsCompleted: string[];
  purchaseHistory: Array<{
    itemName: string;
    priceSen: number;
    paidSen: number;
    timestamp: string;
    attempts: number;
  }>;
  assessmentScores: {
    preTest?: { score: number; total: number; date: string; details: any[] };
    postTest?: { score: number; total: number; date: string; details: any[] };
  };
}

export interface GameSettings {
  soundEnabled: boolean;
  voiceEnabled: boolean;
  volume: number;
  lookSensitivity: number;
  reducedMotion: boolean;
  highContrast: boolean;
  showControlGuides: boolean;
}

export interface CashierScenario {
  id: string;
  title: string;
  dialogue: string;
  items: Array<{
    name: string;
    priceSen: number;
    quantity: number;
  }>;
  targetTotalSen: number;
  hint: string;
}
