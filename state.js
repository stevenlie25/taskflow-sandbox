export const DURATION = 15 * 60 * 1000;
export const initialState = () => ({ tasks: [], focusId: null, sessions: [], timer: null });
export function remaining(timer, now = Date.now()) {
  return timer ? Math.max(0, timer.remaining - (timer.startedAt === null ? 0 : Math.max(0, now - timer.startedAt))) : DURATION;
}
export function finish(state, now = Date.now()) {
  if (!state.timer) return;
  const elapsed = DURATION - remaining(state.timer, now);
  if (elapsed > 0) state.sessions.push({ taskId: state.timer.taskId, title: state.timer.title, duration: elapsed, endedAt: now, completed: elapsed >= DURATION });
  state.timer = null;
}
export function restore(raw) {
  const value = JSON.parse(raw);
  if (!value || !Array.isArray(value.tasks) || !Array.isArray(value.sessions)) throw new Error('Data tidak valid');
  if (!value.tasks.every(t => typeof t.id === 'string' && typeof t.title === 'string' && typeof t.done === 'boolean')) throw new Error('Tugas tidak valid');
  if (!value.sessions.every(s => Number.isFinite(s.duration) && s.duration >= 0 && s.duration <= DURATION)) throw new Error('Sesi tidak valid');
  if (value.timer && !(typeof value.timer.taskId === 'string' && typeof value.timer.title === 'string' && Number.isFinite(value.timer.remaining) && value.timer.remaining >= 0 && value.timer.remaining <= DURATION && (value.timer.startedAt === null || Number.isFinite(value.timer.startedAt)))) throw new Error('Timer tidak valid');
  return { tasks: value.tasks, sessions: value.sessions, focusId: value.focusId ?? null, timer: value.timer ?? null };
}
