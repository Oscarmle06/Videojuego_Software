// auth.js — Authentication module for Velocity Draft web
const _CREDS = { u: 'usuario123', p: 'contraseña123' };
const _KEY   = 'vd_auth';

function isLoggedIn() {
  return sessionStorage.getItem(_KEY) === '1';
}

function login(username, password) {
  if (username === _CREDS.u && password === _CREDS.p) {
    sessionStorage.setItem(_KEY, '1');
    sessionStorage.setItem('vd_user', username);
    return true;
  }
  return false;
}

function logout() {
  sessionStorage.clear();
  window.location.href = 'login.html';
}

function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
  }
}

function getUsername() {
  return sessionStorage.getItem('vd_user') || 'Player';
}

// Use on pages that do NOT require login — shows sign-in link or username + sign-out
function setupNav() {
  const navRight = document.getElementById('navRight');
  if (!navRight) return;
  if (isLoggedIn()) {
    navRight.innerHTML =
      '<span class="text-dimmed me-2" style="font-size:.8rem;">' + getUsername() + '</span>' +
      '<button class="btn btn-outline-secondary btn-sm" onclick="logout()">Sign out</button>';
  } else {
    navRight.innerHTML =
      '<a href="login.html" class="btn btn-outline-primary btn-sm">Sign in</a>';
  }
}
