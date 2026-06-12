// auth.js — Real time session management and role-based access control for Velocity Draft
// This file contains functions to manage user authentication, session storage, and role-based access control for the Velocity Draft game. It includes logic to check if a user is logged in, retrieve their username and role from localStorage, and handle logout functionality. The setupNav function dynamically updates the navigation bar based on the user's role, displaying an admin badge for admins and a player badge for regular users.
// Oscar Lara, Emilio Lara, Aixa Mendoza, Junio 2026

const AUTH_KEY = 'vd_session';

function isLoggedIn() {
  const session = localStorage.getItem(AUTH_KEY);
  return session !== null;
}

function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
  }
}

function getUsername() {
  const sessionData = localStorage.getItem(AUTH_KEY);
  if (sessionData) {
    const session = JSON.parse(sessionData);
    return session.username || "Guest";
  }
  return "Guest";
}

function getUserRole() {
  const sessionData = localStorage.getItem(AUTH_KEY);
  if (sessionData) {
    const session = JSON.parse(sessionData);
    return session.role || 'player'; 
  }
  return 'player'; 
}

function getPlayerId() {
  const sessionData = localStorage.getItem(AUTH_KEY);
  if (sessionData) {
    const session = JSON.parse(sessionData);
    return session.player_id || null; 
  }
  return null; 
}

function logout() {
  localStorage.removeItem(AUTH_KEY); 
  window.location.href = 'login.html';
}

function setupNav() {
  const navRight = d3.select("#navRight");
  if (!navRight.node()) return;

  const username = getUsername();
  const role = getUserRole();

  const roleBadge = role === 'admin'
    ? `<span class="badge bg-danger text-uppercase" style="font-size:0.7rem;">Admin</span>`
    : `<span class="badge bg-secondary text-uppercase" style="font-size:0.7rem;">Player</span>`;

  navRight.html(`
    <div class="d-flex align-items-center gap-3">
      <div class="d-flex align-items-center gap-2">
        ${roleBadge}
        <span class="text-white" style="font-size:.85rem; font-weight: 500;">${username}</span>
      </div>
      <div class="cb-toggle" title="Colorblind mode: N=Normal P=Protanopia D=Deuteranopia T=Tritanopia A=Achromatopsia">
        <button class="cb-btn" data-mode=""             onclick="setColorblindMode('')">N</button>
        <button class="cb-btn" data-mode="protanopia"   onclick="setColorblindMode('protanopia')">P</button>
        <button class="cb-btn" data-mode="deuteranopia" onclick="setColorblindMode('deuteranopia')">D</button>
        <button class="cb-btn" data-mode="tritanopia"   onclick="setColorblindMode('tritanopia')">T</button>
        <button class="cb-btn" data-mode="achromatopsia" onclick="setColorblindMode('achromatopsia')">A</button>
      </div>
      <button class="btn btn-outline-secondary btn-sm" style="font-size:.75rem;" onclick="logout()">Sign out</button>
    </div>
  `);

  // sync active button to current saved mode
  const current = getCbMode();
  document.querySelectorAll('.cb-btn').forEach(btn =>
    btn.classList.toggle('cb-active', btn.dataset.mode === current));
}

// ── COLORBLIND FILTER SUPPORT ──

function injectColorblindFilters() {
  if (document.getElementById('cb-svg-defs')) return;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.id = 'cb-svg-defs';
  svg.style.display = 'none';
  // Vienot et al. 1999 color matrices for the three main dichromacy types
  svg.innerHTML = `<defs>
    <filter id="cb-protanopia" color-interpolation-filters="linearRGB">
      <feColorMatrix type="matrix" values="0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0"/>
    </filter>
    <filter id="cb-deuteranopia" color-interpolation-filters="linearRGB">
      <feColorMatrix type="matrix" values="0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0"/>
    </filter>
    <filter id="cb-tritanopia" color-interpolation-filters="linearRGB">
      <feColorMatrix type="matrix" values="0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0"/>
    </filter>
  </defs>`;
  document.body.appendChild(svg);
}

function getCbMode() {
  return localStorage.getItem('vd_cb_mode') || '';
}

function setColorblindMode(mode) {
  document.body.classList.remove('cb-protanopia', 'cb-deuteranopia', 'cb-tritanopia', 'cb-achromatopsia');
  if (mode) document.body.classList.add('cb-' + mode);
  localStorage.setItem('vd_cb_mode', mode);
  document.querySelectorAll('.cb-btn').forEach(btn =>
    btn.classList.toggle('cb-active', btn.dataset.mode === mode));
}

// Apply saved colorblind mode on every page that loads auth.js
document.addEventListener('DOMContentLoaded', function () {
  injectColorblindFilters();
  const saved = getCbMode();
  if (saved) document.body.classList.add('cb-' + saved);
});

async function login(username, password) {
  try {
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role: 'player' })
    });

    const result = await response.json();

    if (result.success) {
      // AQUÍ ESTABA EL ERROR: Asegúrate de guardar el player_id que viene del backend
      localStorage.setItem(AUTH_KEY, JSON.stringify({
        username: result.username,
        role: result.role,
        player_id: result.player_id // <--- ESTO ES LO QUE ESTABA FALTANDO GUARDAR
      }));
      return true;
    } else {
      console.warn("Login fallido:", result.message);
      return false;
    }
  } catch (error) {
    console.error("Error de conexión:", error);
    return false;
  }
}

async function handleRegister(e) {
    e.preventDefault();
    const data = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        game_name: document.getElementById('game_name').value // El nombre que verán en el leaderboard
    };

    const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    const result = await response.json();
    if (result.success) {
        alert("¡Bienvenido a Velocity Draft!");
        window.location.href = "login.html";
    } else {
        alert("Error: " + result.error);
    }
}