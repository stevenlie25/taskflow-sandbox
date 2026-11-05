import { DURATION, initialState, remaining, finish, restore } from './state.js';
const $ = id => document.getElementById(id);
const KEY = 'taskflow:v1';
let state = initialState(), filter = 'all', editingId = null;
function notify(message) { $('notice').textContent = message; }
try { const raw = localStorage.getItem(KEY); if (raw) state = restore(raw); }
catch { notify('Data tersimpan tidak dapat dibaca. Aplikasi tetap bisa digunakan; penyimpanan lama belum diubah.'); }
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); }
  catch { notify('Penyimpanan browser tidak tersedia atau penuh. Perubahan hanya tersedia selama halaman ini terbuka.'); }
}
const durationLabel = ms => { const seconds = Math.floor(ms / 1000); return `${Math.floor(seconds / 60)} menit ${seconds % 60} detik`; };
function button(text, action, className = '') {
  const el = document.createElement('button'); el.type = 'button'; el.textContent = text; el.className = className; el.addEventListener('click', action); return el;
}
function settle() {
  if (state.timer && remaining(state.timer) === 0) { finish(state); save(); notify('Sesi 15 menit selesai. Kerja bagus! Ambil jeda sejenak.'); return true; }
  return false;
}
function renderTimer() {
  const ms = remaining(state.timer), secs = Math.ceil(ms / 1000);
  $('timer').textContent = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;
  $('timer-status').textContent = state.timer ? (state.timer.startedAt === null ? 'Sedang dijeda' : 'Sedikit demi sedikit, kamu bisa') : 'Siap saat kamu siap';
  $('start').textContent = state.timer ? (state.timer.startedAt === null ? 'Lanjutkan' : 'Jeda') : 'Mulai fokus';
  const selected = state.tasks.find(t => t.id === state.focusId && !t.done);
  $('start').disabled = !state.timer && !selected;
  $('stop').hidden = !state.timer;
  $('focus-title').textContent = state.timer?.title ?? selected?.title ?? 'Belum ada tugas dipilih';
  $('focus-hint').textContent = state.timer ? 'Selesaikan satu langkah kecil selama sesi ini.' : selected ? 'Sudah dipilih. Mulai ketika kamu siap.' : 'Pilih “Fokus” pada salah satu tugas untuk memulai.';
  $('clear-focus').hidden = !selected || !!state.timer;
  const total = state.sessions.reduce((sum, s) => sum + s.duration, 0) + (state.timer ? DURATION - ms : 0);
  $('focus-time').textContent = durationLabel(total);
}
function render() {
  settle();
  const done = state.tasks.filter(t => t.done).length, percent = state.tasks.length ? Math.round(done / state.tasks.length * 100) : 0;
  $('completed').textContent = `${done} / ${state.tasks.length}`; $('progress-text').textContent = `${percent}%`; $('progress').value = percent;
  $('task-count').textContent = `${state.tasks.length} tugas`;
  const list = $('task-list'); list.replaceChildren();
  const visible = state.tasks.filter(t => filter === 'all' || (filter === 'done' ? t.done : !t.done));
  $('empty').hidden = visible.length > 0;
  $('empty').querySelector('h3').textContent = state.tasks.length ? 'Belum ada tugas di kategori ini' : 'Mulai dari satu hal kecil';
  for (const task of visible) {
    const li = document.createElement('li'); li.className = `task ${task.done ? 'done' : ''} ${task.id === state.focusId ? 'selected' : ''}`;
    const check = document.createElement('input'); check.type = 'checkbox'; check.checked = task.done; check.setAttribute('aria-label', `Tandai ${task.title} ${task.done ? 'belum selesai' : 'selesai'}`);
    check.addEventListener('change', () => { settle(); task.done = check.checked; if (task.done && state.focusId === task.id) { if (state.timer) finish(state); state.focusId = null; } save(); render(); });
    const title = document.createElement('span'); title.className = 'task-name'; title.textContent = task.title;
    const actions = document.createElement('div'); actions.className = 'task-actions';
    if (!task.done) { const focus = button(task.id === state.focusId ? '◎ Dipilih' : '◎ Fokus', () => { state.focusId = task.id; save(); render(); }); focus.disabled = !!state.timer; actions.append(focus); }
    const edit = button('Ubah', () => { editingId = task.id; $('edit-title').value = task.title; $('edit-dialog').showModal(); $('edit-title').focus(); }); edit.setAttribute('aria-label', `Ubah ${task.title}`);
    const remove = button('Hapus', () => { if (!confirm(`Hapus tugas “${task.title}”?`)) return; settle(); if (state.timer?.taskId === task.id) finish(state); state.tasks = state.tasks.filter(t => t.id !== task.id); if (state.focusId === task.id) state.focusId = null; save(); render(); }); remove.setAttribute('aria-label', `Hapus ${task.title}`);
    actions.append(edit, remove); li.append(check, title, actions); list.append(li);
  }
  $('history').replaceChildren(); $('history-empty').hidden = state.sessions.length > 0;
  for (const session of state.sessions.slice(-5).reverse()) {
    const li = document.createElement('li'), title = document.createElement('strong'), detail = document.createElement('span');
    title.textContent = session.title; detail.textContent = `${durationLabel(session.duration)} · ${session.completed ? 'Selesai' : 'Dihentikan'} · ${new Date(session.endedAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}`; li.append(title, detail); $('history').append(li);
  }
  renderTimer();
}
$('task-form').addEventListener('submit', event => { event.preventDefault(); const title = $('task-title').value.trim(); if (!title) { $('task-title').setCustomValidity('Tulis nama tugas terlebih dahulu.'); $('task-title').reportValidity(); return; } state.tasks.unshift({ id: crypto.randomUUID(), title, done: false }); $('task-title').value = ''; save(); render(); $('task-title').focus(); });
$('task-title').addEventListener('input', () => $('task-title').setCustomValidity(''));
$('edit-title').addEventListener('input', () => $('edit-title').setCustomValidity(''));
$('edit-form').addEventListener('submit', event => { event.preventDefault(); const title = $('edit-title').value.trim(); if (!title) { $('edit-title').setCustomValidity('Nama tugas tidak boleh kosong.'); $('edit-title').reportValidity(); return; } const task = state.tasks.find(t => t.id === editingId); if (task) { task.title = title; if (state.timer?.taskId === task.id) state.timer.title = title; } save(); $('edit-dialog').close(); render(); });
$('cancel-edit').addEventListener('click', () => $('edit-dialog').close());
document.querySelectorAll('[data-filter]').forEach(el => el.addEventListener('click', () => { filter = el.dataset.filter; document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === el))); render(); }));
$('start').addEventListener('click', () => {
  if (settle()) { render(); return; }
  if (!state.timer) { const task = state.tasks.find(t => t.id === state.focusId && !t.done); if (!task) return; state.timer = { taskId: task.id, title: task.title, remaining: DURATION, startedAt: Date.now() }; }
  else if (state.timer.startedAt === null) state.timer.startedAt = Date.now();
  else { state.timer.remaining = remaining(state.timer); state.timer.startedAt = null; }
  save(); render();
});
$('stop').addEventListener('click', () => { settle(); finish(state); save(); render(); notify('Sesi dihentikan. Waktu yang sudah digunakan tetap tercatat.'); });
$('clear-focus').addEventListener('click', () => { state.focusId = null; save(); render(); });
setInterval(() => { if (settle()) render(); else renderTimer(); }, 250);
document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
render();
