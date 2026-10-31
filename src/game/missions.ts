/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CurrencyDenomination, MissionProgress, CashierScenario } from '../types/game';

export interface CurrencyQuizQuestion {
  id: string;
  targetDenomination: CurrencyDenomination;
  questionText: string;
  options: CurrencyDenomination[];
  hint: string;
  feedbackCorrect: string;
  feedbackIncorrect: string;
}

export const MISSION_1_QUESTIONS: CurrencyQuizQuestion[] = [
  {
    id: 'm1_q1',
    targetDenomination: 5,
    questionText: 'Berapakah nilai wang kertas berwarna HIJAU ini?',
    options: [1, 5, 10],
    hint: 'Lihat nombor "5" dan gambar Burung Enggang Badak.',
    feedbackCorrect: 'Hebat! Ini wang Lima Ringgit (RM5)!',
    feedbackIncorrect: 'Cuba lagi. Perhatikan nombor 5 dan warna hijau pada wang.',
  },
  {
    id: 'm1_q2',
    targetDenomination: 1,
    questionText: 'Berapakah nilai wang kertas berwarna BIRU ini?',
    options: [1, 5, 10],
    hint: 'Lihat nombor "1" dan gambar Wau Bulan yang cantik.',
    feedbackCorrect: 'Tahniah! Ini wang Satu Ringgit (RM1)!',
    feedbackIncorrect: 'Cuba lagi. Lihat nombor 1 di sudut wang kertas.',
  },
  {
    id: 'm1_q3',
    targetDenomination: 10,
    questionText: 'Berapakah nilai wang kertas berwarna MERAH ini?',
    options: [1, 5, 10],
    hint: 'Lihat nombor "10" dan gambar Bunga Rafflesia yang besar.',
    feedbackCorrect: 'Cemerlang! Ini wang Sepuluh Ringgit (RM10)!',
    feedbackIncorrect: 'Cuba lagi. Cari nombor 10 pada wang berwarna merah.',
  },
  {
    id: 'm1_q4',
    targetDenomination: 1,
    questionText: 'Wang kertas ini ada gambar Wau Bulan. Berapakah nilainya?',
    options: [1, 5, 10],
    hint: 'Wang biru ini nilainya ialah Satu Ringgit.',
    feedbackCorrect: 'Bagus sekali! Wang Wau Bulan bernilai Satu Ringgit (RM1)!',
    feedbackIncorrect: 'Cuba lagi. Wau Bulan ada pada wang RM1 berwarna biru.',
  },
  {
    id: 'm1_q5',
    targetDenomination: 5,
    questionText: 'Jika kamu nampak wang hijau dengan nombor 5, berapakah nilainya?',
    options: [1, 5, 10],
    hint: 'Warna hijau melambangkan wang Lima Ringgit.',
    feedbackCorrect: 'Bijak! Ini sememangnya wang Lima Ringgit (RM5)!',
    feedbackIncorrect: 'Cuba semak semula. Nombor 5 bersamaan Lima Ringgit.',
  },
];

export const CASHIER_SCENARIOS: CashierScenario[] = [
  {
    id: 'scene_1',
    title: 'Pembelian 1: Pensel Sekolah',
    dialogue: 'Hai adik bijak! Pensel ini berharga RM1. Sila masukkan wang RM1.',
    items: [{ name: 'Pensel 2B', priceSen: 100, quantity: 1 }],
    targetTotalSen: 100,
    hint: 'Pilih 1 keping wang RM1 (warna biru).',
  },
  {
    id: 'scene_2',
    title: 'Pembelian 2: Roti Sarapan',
    dialogue: 'Wah, sedapnya roti ini! Harganya RM2. Sila bayar dua ringgit.',
    items: [{ name: 'Roti Enak', priceSen: 200, quantity: 1 }],
    targetTotalSen: 200,
    hint: 'Pilih wang RM1 sebanyak 2 kali (RM1 + RM1 = RM2).',
  },
  {
    id: 'scene_3',
    title: 'Pembelian 3: Buku Nota Kemas',
    dialogue: 'Buku nota ini harganya RM3. Sila masukkan wang bernilai tiga ringgit.',
    items: [{ name: 'Buku Nota', priceSen: 300, quantity: 1 }],
    targetTotalSen: 300,
    hint: 'Pilih 3 keping wang RM1 (RM1 + RM1 + RM1 = RM3).',
  },
  {
    id: 'scene_4',
    title: 'Pembelian 4: Epal Merah Manis',
    dialogue: 'Epal merah manis berharga RM4. Jom bayar empat ringgit.',
    items: [{ name: 'Epal Manis', priceSen: 400, quantity: 1 }],
    targetTotalSen: 400,
    hint: 'Pilih 4 keping wang RM1 (RM1 + RM1 + RM1 + RM1 = RM4).',
  },
  {
    id: 'scene_5',
    title: 'Pembelian 5: Susu Lembu Segar',
    dialogue: 'Susu segar yang sihat ini berharga RM5. Sila bayar lima ringgit.',
    items: [{ name: 'Susu Segar', priceSen: 500, quantity: 1 }],
    targetTotalSen: 500,
    hint: 'Kamu boleh pilih 1 keping wang RM5 (hijau), atau lima keping wang RM1.',
  },
];

export const INITIAL_MISSIONS: MissionProgress[] = [
  {
    id: 'mission_1',
    title: 'Misi 1: Kenali Wang',
    shortDesc: 'Terokai Stesen Wang dan kenali wang kertas RM1, RM5 dan RM10.',
    completed: false,
    stars: 0,
    bestScore: 0,
  },
  {
    id: 'mission_2',
    title: 'Misi 2: Jom Pilih Barang',
    shortDesc: 'Cari barang di rak supermarket, semak tanda harga dan masukkan ke dalam bakul.',
    completed: false,
    stars: 0,
    bestScore: 0,
  },
  {
    id: 'mission_3',
    title: 'Misi 3: Bayar di Kaunter',
    shortDesc: 'Bawa bakul belanja ke kaunter juruwang dan buat bayaran tepat dengan wang kertas!',
    completed: false,
    stars: 0,
    bestScore: 0,
  },
];

export interface AssessmentQuestion {
  id: string;
  question: string;
  imageUrl?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const PRE_TEST_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'pre_1',
    question: 'Apakah warna wang kertas Satu Ringgit (RM1)?',
    options: ['Biru', 'Hijau', 'Merah'],
    correctIndex: 0,
    explanation: 'Wang RM1 berwarna biru.',
  },
  {
    id: 'pre_2',
    question: 'Berapakah nilai wang kertas berwarna hijau?',
    options: ['RM1', 'RM5', 'RM10'],
    correctIndex: 1,
    explanation: 'Wang hijau bernilai RM5.',
  },
  {
    id: 'pre_3',
    question: 'Jika harga sebatang pensel ialah RM1, wang manakah yang perlu diberi?',
    options: ['1 keping RM1', '1 keping RM5', '1 keping RM10'],
    correctIndex: 0,
    explanation: 'Pensel RM1 memerlukan 1 keping wang RM1.',
  },
  {
    id: 'pre_4',
    question: 'Berapakah jumlah wang bagi RM1 + RM1?',
    options: ['RM2', 'RM3', 'RM4'],
    correctIndex: 0,
    explanation: 'RM1 ditambah RM1 menjadi RM2.',
  },
  {
    id: 'pre_5',
    question: 'Bunga apakah yang terdapat pada wang kertas Sepuluh Ringgit (RM10)?',
    options: ['Bunga Rafflesia', 'Bunga Raya', 'Bunga Ros'],
    correctIndex: 0,
    explanation: 'Wang RM10 memaparkan Bunga Rafflesia.',
  },
];

export const POST_TEST_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'post_1',
    question: 'Apakah warna wang kertas Lima Ringgit (RM5)?',
    options: ['Biru', 'Hijau', 'Merah'],
    correctIndex: 1,
    explanation: 'Wang RM5 berwarna hijau.',
  },
  {
    id: 'post_2',
    question: 'Berapakah nilai wang kertas berwarna merah?',
    options: ['RM1', 'RM5', 'RM10'],
    correctIndex: 2,
    explanation: 'Wang merah bernilai RM10.',
  },
  {
    id: 'post_3',
    question: 'Roti berharga RM2. Berapakah keping wang RM1 yang diperlukan?',
    options: ['1 keping', '2 keping', '3 keping'],
    correctIndex: 1,
    explanation: 'Dua keping RM1 bersamaan RM2.',
  },
  {
    id: 'post_4',
    question: 'Berapakah jumlah wang bagi RM5 + RM1?',
    options: ['RM4', 'RM6', 'RM7'],
    correctIndex: 1,
    explanation: 'RM5 ditambah RM1 menjadi RM6.',
  },
  {
    id: 'post_5',
    question: 'Burung apakah yang terdapat pada wang kertas Lima Ringgit (RM5)?',
    options: ['Burung Enggang Badak', 'Burung Merak', 'Burung Helang'],
    correctIndex: 0,
    explanation: 'Wang RM5 memaparkan Burung Enggang Badak.',
  },
];
