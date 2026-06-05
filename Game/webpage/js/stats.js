// stats.js — Local statistics tracker for Velocity Draft web
const _SK = 'vd_stats';

function _getStats() {
  try { return Object.assign(_def(), JSON.parse(localStorage.getItem(_SK) || '{}')); }
  catch { return _def(); }
}

function _def() {
  return { sessions: 0, playSeconds: 0, lastPlayed: null };
}

function _save(s) { localStorage.setItem(_SK, JSON.stringify(s)); }

function incrementSessions() {
  const s = _getStats();
  s.sessions++;
  s.lastPlayed = new Date().toISOString();
  _save(s);
}

function addPlayTime(seconds) {
  const s = _getStats();
  s.playSeconds = (s.playSeconds || 0) + Math.round(seconds);
  _save(s);
}

function getStats() { return _getStats(); }

function resetStats() { _save(_def()); }

function fmtTime(sec) {
  sec = Math.round(sec || 0);
  if (sec < 60) return sec + 's';
  if (sec < 3600) return Math.floor(sec / 60) + 'm ' + (sec % 60) + 's';
  return Math.floor(sec / 3600) + 'h ' + Math.floor((sec % 3600) / 60) + 'm';
}

function fmtDate(iso) {
  if (!iso) return 'Nunca';
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}
