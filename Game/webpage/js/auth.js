// auth.js — Sistema de Sesiones Real (Conectado a LocalStorage)

const AUTH_KEY = 'vd_session';

// 1. VALIDACIÓN DE SESIÓN REAL
function isLoggedIn() {
  // Verificamos si existe la llave en localStorage
  const session = localStorage.getItem(AUTH_KEY);
  return session !== null;
}

function requireAuth() {
  // Si NO está logueado, lo mandamos directo a login.html
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
  }
}

// 2. EXTRACCIÓN DINÁMICA DE DATOS
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
    return session.role || 'player'; // Retorna 'player' o 'admin' según la DB
  }
  return 'player'; 
}

// 3. FUNCIONES COMPLEMENTARIAS
function logout() {
  localStorage.removeItem(AUTH_KEY); // Limpia la sesión
  window.location.href = 'login.html';
}

function setupNav() {
  const navRight = d3.select("#navRight"); 
  if (!navRight.node()) return;

  const username = getUsername();
  const role = getUserRole();

  // 💡 Extra: Le agregamos un pequeño Badge visual para distinguir al Admin en el Navbar
  const roleBadge = role === 'admin' 
    ? `<span class="badge bg-danger text-uppercase" style="font-size:0.7rem;">Admin</span>` 
    : `<span class="badge bg-secondary text-uppercase" style="font-size:0.7rem;">Player</span>`;

  navRight.html(`
    <div class="d-flex align-items-center gap-3">
      <div class="d-flex align-items-center gap-2">
        ${roleBadge}
        <span class="text-white" style="font-size:.85rem; font-weight: 500;">${username}</span>
      </div>
      <button class="btn btn-outline-secondary btn-sm" style="font-size:.75rem;" onclick="logout()">Sign out</button>
    </div>
  `);
}

async function login(username, password) {
  try {
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role: 'player' })
    });

    const result = await response.json();

    if (result.success) {
      localStorage.setItem(AUTH_KEY, JSON.stringify({
        username: result.username,
        role: result.role,
        player_id: result.player_id
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