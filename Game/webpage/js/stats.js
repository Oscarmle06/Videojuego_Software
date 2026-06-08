// stats.js - File responsible for fetching and displaying stats.
// This file contains functions to connect with the backend API to retrieve player statistics and render them in the Fighter Hub dashboard. It also includes logic to toggle between player and admin views, and to render admin analytics using Chart.js.
// Oscar Lara, Emilio Lara, Aixa Mendoza, Junio 2026

const API_STATS_URL = 'http://localhost:3000/api/stats';
const API_LEADERBOARD_URL = 'http://localhost:3000/api/leaderboard'; 

/**
 * Conecta con el backend para jalar las estadísticas del jugador logueado
 */
async function getPlayerStatsFromDB() {
  // Ahora usamos la función que acabas de crear en auth.js
  const pid = getPlayerId(); 
  
  if (!pid) {
      console.warn("No se encontró player_id. Asegúrate de estar logueado.");
      return null;
  }

  try {
    const response = await fetch(`http://localhost:3000/api/stats?player_id=${pid}`);
    const result = await response.json();
    
    if (result.success) return result.data;
    return null;
  } catch (error) {
    console.error("Error al conectar con la API de stats:", error);
    return null;
  }
}

/**
 * Inicializa y alterna las vistas del Fighter Hub dependiendo del rol detectado
 */
async function initViews(role) {
  const playerView = document.getElementById('view-player');
  const adminSection = document.getElementById('admin-analytics-section');

  if (role === 'admin') {
    // Si eres admin, ocultamos el tablero de jugador y mostramos el de admin
    if (playerView) playerView.classList.add('d-none');
    if (adminSection) {
        adminSection.classList.remove('d-none');
        await renderAdminAnalytics();
    }
  } else {
    // Si eres player, mostramos el tablero y ocultamos el de admin
    if (playerView) playerView.classList.remove('d-none');
    if (adminSection) adminSection.classList.add('d-none');
    
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

// Función para renderizar el leaderboard usando D3.js
async function renderArcadeLeaderboard() {
  const tbody = d3.select("#leaderboard-body");
  tbody.html("");

  try {
    const response = await fetch(API_LEADERBOARD_URL);
    const result = await response.json();
    
    if (!result.success || !result.data) return;

    // AHORA USAMOS player_id PARA SABER QUIÉN ERES
    const myPlayerId = parseInt(getPlayerId()); 

    const rows = tbody.selectAll("tr")
      .data(result.data.map((d, i) => ({ 
        ...d, 
        rank: i + 1, 
        // Comparamos el ID del jugador en la fila vs tu ID actual
        isMe: parseInt(d.player_id) === parseInt(myPlayerId)
      })))
      .enter()
      .append("tr")
      .attr("class", d => d.isMe ? "rank-me" : "");

    rows.append("td")
      .attr("class", d => d.rank <= 3 ? "rank-top" : "")
      .text(d => d.rank === 1 ? `🥇 ${d.rank}` : d.rank === 2 ? `🥈 ${d.rank}` : d.rank === 3 ? `🥉 ${d.rank}` : d.rank);
      
    rows.append("td")
      .style("text-align", "left")
      .html(d => {
        const nameText = d.isMe ? `<strong class="text-cyan">${d.name}</strong>` : d.name;
        const youBadge = d.isMe ? `<span class="badge bg-info text-dark ms-2" style="font-size:0.6rem; vertical-align: middle;">YOU</span>` : "";
        return `${nameText} ${youBadge}`;
      });

    rows.append("td").text(d => d.games);
    rows.append("td").text(d => d.wins);
    rows.append("td")
      .attr("class", "text-danger fw-bold")
      .text(d => `${d.bestLap}s`);

  } catch (error) {
    console.error("Error loading leaderboard:", error);
  }
}

async function renderAdminAnalytics() {
    const section = document.getElementById('admin-analytics-section');
    if (!section) return;
    
    section.classList.remove('d-none');

    try {
        // 1. Gráfica de Cartas (Barras)
        const resCards = await fetch('http://localhost:3000/api/admin/top-cards');
        const { data: cardsData } = await resCards.json();

        const ctx1 = document.getElementById('adminCardsChart').getContext('2d');
        new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: cardsData.map(c => c.name),
                datasets: [{
                    label: 'Total Uses',
                    data: cardsData.map(c => c.total_uses),
                    backgroundColor: '#ff5555'
                }]
            },
            options: { 
                responsive: true,
                plugins: {
                    title: { display: true, text: 'TOP 10 MOST USED CARDS (GLOBAL)', color: '#fff', font: { size: 18 } },
                    legend: { labels: { color: '#fff' } }
                },
                scales: {
                    x: { ticks: { color: '#fff' } },
                    y: { ticks: { color: '#fff' } }
                }
            }
        });

        // 2. Gráfica de Tendencia (Líneas)
        const resTrends = await fetch('http://localhost:3000/api/admin/time-trends');
        const { data: trendsData } = await resTrends.json();

        const ctx2 = document.getElementById('adminTimeTrendsChart').getContext('2d');
        new Chart(ctx2, {
            type: 'line',
            data: {
                labels: trendsData.map(d => new Date(d.day).toLocaleDateString()), // Formateamos la fecha
                datasets: [{
                    label: 'Avg Play Time (s)',
                    data: trendsData.map(d => d.avg_time),
                    borderColor: '#ff5555',
                    backgroundColor: 'rgba(255, 85, 85, 0.5)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: { 
                responsive: true,
                plugins: {
                    title: { display: true, text: 'TIME TRENDS (LAST WEEK)', color: '#fff', font: { size: 18 } },
                    legend: { labels: { color: '#fff' } }
                },
                scales: {
                    x: { ticks: { color: '#fff' } },
                    y: { ticks: { color: '#fff' } }
                }
            }
        });

        // 3. Gráfica de Distribución de Carreras (Pastel)
        const resDistribution = await fetch('http://localhost:3000/api/admin/race-distribution');
        const { data: distributionData } = await resDistribution.json();

        const ctx3 = document.getElementById('adminRaceDistributionChart').getContext('2d');
        new Chart(ctx3, {
            type: 'doughnut',
            data: {
                labels: distributionData.map(d => d.category),
                datasets: [{
                    label: 'Number of Races',
                    data: distributionData.map(d => d.count),
                    backgroundColor: [
                        '#ff5555',
                        '#55ff55',
                        '#5555ff'
                    ]
                }]
            },
            options: { 
                responsive: true,
                plugins: {
                    title: { display: true, text: 'RACE DISTRIBUTION', color: '#fff', font: { size: 18 } },
                    legend: { labels: { color: '#fff' } }
                }
            }
        });

    } catch (error) {
        console.error("Error loading admin analytics:", error);
    }
}