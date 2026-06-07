// stats.js — Sincronizado con MariaDB Engine y D3.js Leaderboard

// API Endpoints
const API_STATS_URL = 'http://localhost:3000/api/stats';
const API_LEADERBOARD_URL = 'http://localhost:3000/api/leaderboard'; 

/**
 * Conecta con el backend para jalar las estadísticas del jugador logueado
 */
async function getPlayerStatsFromDB() {
  try {
    const response = await fetch(API_STATS_URL);
    const result = await response.json();
    if (result.success) return result.data;
    return null;
  } catch (error) {
    console.error("Error while fetching player stats:", error);
    return null;
  }
}

/**
 * Inicializa y alterna las vistas del Fighter Hub dependiendo del rol detectado
 */
async function initViews(role) {
  // Ya no buscamos el roleBadge aquí porque setupNav() se encarga del diseño en el navbar
  const playerView = document.getElementById('view-player');
  const adminView = document.getElementById('view-admin');

  if (role === 'admin') {
    // Si eres admin, ocultamos la vista de player y mostramos la de admin
    if (playerView) playerView.classList.add('d-none');
    if (adminView) adminView.classList.remove('d-none');
  } else {
    // Si eres player, mostramos la vista de player y ocultamos la de admin
    if (playerView) playerView.classList.remove('d-none');
    if (adminView) adminView.classList.add('d-none');
    
    // Carga de datos
    await renderPlayerDashboard();
    await renderArcadeLeaderboard();
  }
}

/**
 * Pinta los récords numéricos en las tarjetas de Bootstrap superiores
 */
async function renderPlayerDashboard() {
  const sessionEl = document.getElementById('statSessions');
  const winsEl    = document.getElementById('statWins');
  const bestLapEl = document.getElementById('statBestLap');
  const avgTimeEl = document.getElementById('statAvgTime');

  // Solo procedemos si tenemos los elementos Y los datos
  const stats = await getPlayerStatsFromDB();
  
  if (sessionEl && stats) sessionEl.textContent = stats.totalGames || 0;
  if (winsEl && stats)    winsEl.textContent    = stats.wins || 0;
  if (bestLapEl && stats) bestLapEl.textContent  = `${stats.bestLap || '0.00'}s`;
  if (avgTimeEl && stats) avgTimeEl.textContent  = `${stats.avgTime || '0.00'}s`;
}



// Función para renderizar el leaderboard usando D3.js, ahora con datos reales del backend
async function renderArcadeLeaderboard() {
  const tbody = d3.select("#leaderboard-body");
  tbody.html(""); // Limpieza

  try {
    const response = await fetch(API_LEADERBOARD_URL);
    const result = await response.json();
    
    if (!result.success || !result.data) {
      console.warn("No hay datos de leaderboard disponibles.");
      return;
    }

    const username = getUsername();

    // Aquí usamos los datos que vienen del servidor (result.data)
    const rows = tbody.selectAll("tr")
      .data(result.data.map((d, i) => ({ ...d, rank: i + 1, isMe: d.name === username })))
      .enter()
      .append("tr")
      .attr("class", d => d.isMe ? "rank-me" : "");

    rows.append("td")
      .attr("class", d => d.rank <= 3 ? "rank-top" : "")
      .text(d => d.rank === 1 ? `🥇 ${d.rank}` : d.rank === 2 ? `🥈 ${d.rank}` : d.rank === 3 ? `🥉 ${d.rank}` : d.rank);
      
    rows.append("td")
      .style("text-align", "left")
      .html(d => d.isMe ? `<strong class="text-cyan">${d.name}</strong>` : d.name);

    rows.append("td").text(d => d.games);
    rows.append("td").text(d => d.wins);
    rows.append("td")
      .attr("class", "text-danger fw-bold")
      .text(d => `${d.bestLap}s`);

  } catch (error) {
    console.error("❌ Error fatal al cargar leaderboard:", error);
  }
}