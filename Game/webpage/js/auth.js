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