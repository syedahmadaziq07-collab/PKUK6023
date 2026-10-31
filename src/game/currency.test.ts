/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  senToRinggitString,
  calculateTotalSen,
  formatNotesFormula,
  validatePayment,
  getOptimalNotes,
} from './currency';

test('senToRinggitString converts sen correctly', () => {
  assert.equal(senToRinggitString(100), 'RM1');
  assert.equal(senToRinggitString(200), 'RM2');
  assert.equal(senToRinggitString(500), 'RM5');
  assert.equal(senToRinggitString(1000), 'RM10');
  assert.equal(senToRinggitString(1500), 'RM15');
  assert.equal(senToRinggitString(0), 'RM0');
});

test('calculateTotalSen sums notes properly', () => {
  assert.equal(calculateTotalSen([1, 1]), 200);
  assert.equal(calculateTotalSen([5]), 500);
  assert.equal(calculateTotalSen([10, 5, 1]), 1600);
  assert.equal(calculateTotalSen([]), 0);
});

test('formatNotesFormula produces child-friendly equations', () => {
  assert.equal(formatNotesFormula([]), 'RM0');
  assert.equal(formatNotesFormula([1]), 'RM1');
  assert.equal(formatNotesFormula([1, 1]), 'RM1 + RM1 = RM2');
  assert.equal(formatNotesFormula([5, 1]), 'RM5 + RM1 = RM6');
  assert.equal(formatNotesFormula([1, 1, 1]), 'RM1 + RM1 + RM1 = RM3');
});

test('validatePayment verifies exact amount correctly', () => {
  // Exact payment for RM2 (200 sen)
  const exact = validatePayment([1, 1], 200, true);
  assert.equal(exact.valid, true);
  assert.equal(exact.isExact, true);
  assert.equal(exact.differenceSen, 0);

  // Underpayment: paid RM1 for RM2
  const under = validatePayment([1], 200, true);
  assert.equal(under.valid, false);
  assert.equal(under.isUnder, true);
  assert.equal(under.differenceSen, -100);

  // Overpayment: paid RM5 for RM2 with requireExact=true
  const overExact = validatePayment([5], 200, true);
  assert.equal(overExact.valid, false);
  assert.equal(overExact.isOver, true);
  assert.equal(overExact.differenceSen, 300);

  // Overpayment with requireExact=false allows change
  const overAllow = validatePayment([5], 200, false);
  assert.equal(overAllow.valid, true);
  assert.equal(overAllow.changeSen, 300);
});

test('getOptimalNotes calculates smallest note breakdown', () => {
  assert.deepEqual(getOptimalNotes(200), [1, 1]);
  assert.deepEqual(getOptimalNotes(300), [1, 1, 1]);
  assert.deepEqual(getOptimalNotes(500), [5]);
  assert.deepEqual(getOptimalNotes(700), [5, 1, 1]);
  assert.deepEqual(getOptimalNotes(1000), [10]);
});
