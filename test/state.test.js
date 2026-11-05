import test from 'node:test';
import assert from 'node:assert/strict';
import { DURATION, initialState, remaining, finish, restore } from '../state.js';
test('timer dipulihkan menggunakan waktu nyata', () => {
  const state = initialState(); state.timer = { taskId: '1', title: 'Tugas', remaining: DURATION, startedAt: 1000 };
  assert.equal(remaining(restore(JSON.stringify(state)).timer, 61000), DURATION - 60000);
});
test('jeda dan lanjut tidak menghitung waktu jeda', () => {
  const timer = { remaining: DURATION, startedAt: 1000 };
  timer.remaining = remaining(timer, 61000); timer.startedAt = null;
  assert.equal(remaining(timer, 900000), DURATION - 60000);
  timer.startedAt = 1000000;
  assert.equal(remaining(timer, 1030000), DURATION - 90000);
});
test('berhenti menyimpan waktu parsial tepat sekali', () => {
  const state = initialState(); state.timer = { taskId: '1', title: 'Tugas', remaining: DURATION, startedAt: 1000 };
  finish(state, 61000); finish(state, 62000);
  assert.equal(state.sessions.length, 1); assert.equal(state.sessions[0].duration, 60000); assert.equal(state.sessions[0].completed, false);
});
test('sesi dibatasi 15 menit meskipun tab tidak aktif', () => {
  const state = initialState(); state.timer = { taskId: '1', title: 'Tugas', remaining: DURATION, startedAt: 1000 };
  finish(state, DURATION * 3);
  assert.equal(state.sessions[0].duration, DURATION); assert.equal(state.sessions[0].completed, true);
});
test('tugas dan fokus dipulihkan; data rusak ditolak', () => {
  const state = initialState(); state.tasks.push({ id: '1', title: '<script>alert(1)</script>', done: true }); state.focusId = '1';
  assert.deepEqual(restore(JSON.stringify(state)), state);
  assert.throws(() => restore('{broken')); assert.throws(() => restore('{"tasks":[],"sessions":[{"duration":-1}]}'));
});
