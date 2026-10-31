/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from '../types/game';

export const SUPERMARKET_PRODUCTS: Product[] = [
  {
    id: 'roti_segar',
    name: 'Roti Enak',
    category: 'roti',
    priceSen: 200,
    priceDisplay: 'RM2',
    description: 'Roti putih lembut berkhasiat untuk sarapan pagi.',
    shelfLocation: { x: -3.2, y: 1.15, z: -1.2 },
    color: '#d97706', // warm golden crust
    secondaryColor: '#fef3c7',
    modelType: 'bread',
  },
  {
    id: 'susu_segar',
    name: 'Susu Segar',
    category: 'minuman',
    priceSen: 500,
    priceDisplay: 'RM5',
    description: 'Susu lembu asli kaya dengan kalsium untuk tulang kuat.',
    shelfLocation: { x: -3.2, y: 1.15, z: 1.8 },
    color: '#3b82f6', // pastel blue carton
    secondaryColor: '#ffffff',
    modelType: 'milk',
  },
  {
    id: 'pensel_warna',
    name: 'Pensel 2B',
    category: 'alat_tulis',
    priceSen: 100,
    priceDisplay: 'RM1',
    description: 'Pensel berkualiti untuk menulis dan melukis di sekolah.',
    shelfLocation: { x: 3.2, y: 1.15, z: -1.2 },
    color: '#eab308', // classic yellow pencil
    secondaryColor: '#f43f5e',
    modelType: 'pencil',
  },
  {
    id: 'buku_nota',
    name: 'Buku Nota',
    category: 'alat_tulis',
    priceSen: 300,
    priceDisplay: 'RM3',
    description: 'Buku nota bergaris kemas dengan kulit buku berwarna.',
    shelfLocation: { x: 3.2, y: 1.15, z: 0.6 },
    color: '#8b5cf6', // purple cover
    secondaryColor: '#fafafa',
    modelType: 'notebook',
  },
  {
    id: 'epal_merah',
    name: 'Epal Manis',
    category: 'buah',
    priceSen: 400,
    priceDisplay: 'RM4',
    description: 'Epal merah ranum yang manis dan penuh vitamin.',
    shelfLocation: { x: 3.2, y: 1.15, z: 2.2 },
    color: '#ef4444', // ruby red apple
    secondaryColor: '#22c55e',
    modelType: 'apple',
  },
  {
    id: 'air_mineral',
    name: 'Air Mineral',
    category: 'minuman',
    priceSen: 100,
    priceDisplay: 'RM1',
    description: 'Air mineral semulajadi menyegarkan badan.',
    shelfLocation: { x: -3.2, y: 1.15, z: 3.4 },
    color: '#06b6d4', // cyan bottle
    secondaryColor: '#e0f2fe',
    modelType: 'water',
  },
];
