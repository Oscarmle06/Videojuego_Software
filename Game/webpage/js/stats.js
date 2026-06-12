// stats.js
// Fetches player statistics from the backend API and renders them in the Fighter Hub dashboard.
// Handles role-based view switching (player vs. admin) and builds Chart.js / D3.js visualizations.
// Oscar Lara, Emilio Lara, Aixa Mendoza, June 2026

const API_STATS_URL       = 'http://localhost:3000/api/stats';
const API_LEADERBOARD_URL = 'http://localhost:3000/api/leaderboard';
const chartTextColor = '#f0f0ff';
const chartGridColor = 'rgba(136, 136, 170, 0.18)';
// F1 telemetry palette — matches the site's .theme-f1 CSS variables
const chartPalette = {
  cyan:   '#00e5ff',
  green:  '#00cc77',
  red:    '#ff4060',
  yellow: '#ffe600', // telemetry amber
  purple: '#ff2d75'  // racing magenta (theme secondary)
};

async function getPlayerStatsFromDB() { // Fetches aggregate stats for the logged-in player from the API; returns null if not logged in or the request fails
  const pid = getPlayerId(); // player_id is written to localStorage by auth.js on login

  if (!pid) {
    console.warn("No player_id found — make sure the user is logged in.");
    return null;
  }

  try {
    const response = await fetch(`http://localhost:3000/api/stats?player_id=${pid}`);
    const result   = await response.json();
    if (result.success) return result.data;
    return null;
  } catch (error) {
    console.error("Error connecting to the stats API:", error);
    return null;
  }
}

async function initViews(role) { // Shows the correct Fighter Hub view for the detected role — admins see analytics, players see their dashboard and the leaderboard
  const playerView   = document.getElementById('view-player');
  const adminSection = document.getElementById('admin-analytics-section');

  if (role === 'admin') {
    if (playerView)   playerView.classList.add('d-none');    // hide player board for admins
    if (adminSection) {
      adminSection.classList.remove('d-none');
      await renderAdminAnalytics();
    }
  } else {
    if (playerView)   playerView.classList.remove('d-none'); // show player board
    if (adminSection) adminSection.classList.add('d-none');  // hide admin section for regular players

    await renderPlayerDashboard();
    await renderArcadeLeaderboard();
  }
}

async function renderPlayerDashboard() { // Populates the four Bootstrap stat cards at the top of the player view with live data from the API
  const sessionEl = document.getElementById('statSessions');
  const winsEl    = document.getElementById('statWins');
  const bestLapEl = document.getElementById('statBestLap');
  const avgTimeEl = document.getElementById('statAvgTime');

  const stats = await getPlayerStatsFromDB();

  // Guard each write against both a missing DOM element and a failed API response
  if (sessionEl && stats) sessionEl.textContent = stats.totalGames || 0;
  if (winsEl    && stats) winsEl.textContent    = stats.wins       || 0;
  if (bestLapEl && stats) bestLapEl.textContent = `${stats.bestLap || '0.00'}s`;
  if (avgTimeEl && stats) avgTimeEl.textContent = `${stats.avgTime || '0.00'}s`;
}

async function renderArcadeLeaderboard() { // Builds the D3.js leaderboard table; highlights the current player's row and adds medal emojis for the top 3
  const tbody = d3.select("#leaderboard-body");
  tbody.html(""); // clear previous render before re-populating

  try {
    const response = await fetch(API_LEADERBOARD_URL);
    const result   = await response.json();
    if (!result.success || !result.data) return;

    const myPlayerId = parseInt(getPlayerId()); // compare as integers to avoid "1" !== 1 mismatches

    const rows = tbody.selectAll("tr")
      .data(result.data.map((d, i) => ({
        ...d,
        rank: i + 1,
        isMe: parseInt(d.player_id) === myPlayerId // flag used to apply the .rank-me highlight class
      })))
      .enter()
      .append("tr")
      .attr("class", d => d.isMe ? "rank-me" : "");

    rows.append("td")
      .attr("class", d => d.rank <= 3 ? "rank-top" : "")
      .text(d => d.rank === 1 ? `🥇 ${d.rank}` : d.rank === 2 ? `🥈 ${d.rank}` : d.rank === 3 ? `🥉 ${d.rank}` : d.rank);

    rows.append("td")
      .style("text-align", "left")
      .html(d => { // bold cyan name + "YOU" badge for the current player
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

async function renderAdminAnalytics() { // Fetches three admin endpoints and renders a Chart.js visualization for each: card impact, daily quality trends, and per-race performance
  const section = document.getElementById('admin-analytics-section');
  if (!section) return;

  section.classList.remove('d-none');

  try {
    // Apply theme colors globally so all three charts inherit them without per-chart config
    Chart.defaults.color       = chartTextColor;
    Chart.defaults.borderColor = chartGridColor;

    // --- Chart 1: Card Impact (bars = selected/activated counts, line = podium rate) ---
    const resCards = await fetch('http://localhost:3000/api/admin/card-impact');
    const { data: cardsData = [] } = await resCards.json();

    const ctx1 = document.getElementById('adminCardsChart').getContext('2d');
    new Chart(ctx1, {
      type: 'bar',
      data: {
        labels: cardsData.map(c => c.name),
        datasets: [
          {
            label: 'Selected',
            data: cardsData.map(c => Number(c.selected_count) || 0),
            backgroundColor: chartPalette.cyan,
            borderRadius: 6,
            yAxisID: 'count'
          },
          {
            label: 'Activated',
            data: cardsData.map(c => Number(c.activated_count) || 0),
            backgroundColor: chartPalette.purple,
            borderRadius: 6,
            yAxisID: 'count'
          },
          {
            type: 'line', // overlay on the same chart via a secondary y-axis
            label: 'Podium rate (%)',
            data: cardsData.map(c => Number(c.podium_rate) || 0),
            borderColor: chartPalette.yellow,
            backgroundColor: chartPalette.yellow,
            pointRadius: 4,
            tension: 0.35,
            yAxisID: 'rate'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              afterBody(items) { // append extra stats below the default tooltip lines
                const card = cardsData[items[0].dataIndex];
                return [`Avg finish: ${card.avg_position || 'N/A'}`, `Best lap: ${card.best_lap || 'N/A'}s`];
              }
            }
          },
          legend: { labels: { usePointStyle: true } }
        },
        scales: {
          x: { grid: { display: false } },
          count: { beginAtZero: true, ticks: { precision: 0 }, title: { display: true, text: 'Count' } },
          rate: {
            beginAtZero: true,
            max: 100,
            position: 'right',
            ticks: { color: chartPalette.yellow, callback: value => `${value}%` },
            grid: { drawOnChartArea: false } // avoid double grid lines from both y-axes
          }
        }
      }
    });

    // --- Chart 2: Daily Quality Trends (bars = race count per day, lines = avg time / best lap / podium rate) ---
    const resTrends = await fetch('http://localhost:3000/api/admin/daily-quality');
    const { data: trendsData = [] } = await resTrends.json();

    const ctx2 = document.getElementById('adminTimeTrendsChart').getContext('2d');
    new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: trendsData.map(d => new Date(d.day).toLocaleDateString()),
        datasets: [
          {
            label: 'Races',
            data: trendsData.map(d => Number(d.races) || 0),
            backgroundColor: 'rgba(0, 212, 255, 0.25)', // translucent fill so time-series lines remain visible
            borderColor: chartPalette.cyan,
            borderWidth: 1,
            borderRadius: 6,
            yAxisID: 'count'
          },
          {
            type: 'line',
            label: 'Avg time (s)',
            data: trendsData.map(d => Number(d.avg_time) || 0),
            borderColor: chartPalette.red,
            backgroundColor: chartPalette.red,
            pointRadius: 4,
            tension: 0.35,
            yAxisID: 'seconds'
          },
          {
            type: 'line',
            label: 'Best lap (s)',
            data: trendsData.map(d => Number(d.best_lap) || 0),
            borderColor: chartPalette.green,
            backgroundColor: chartPalette.green,
            pointRadius: 4,
            tension: 0.35,
            yAxisID: 'seconds'
          },
          {
            type: 'line',
            label: 'Podium rate (%)',
            data: trendsData.map(d => Number(d.podium_rate) || 0),
            borderColor: chartPalette.yellow,
            backgroundColor: chartPalette.yellow,
            borderDash: [6, 4], // dashed to visually distinguish it from the solid time lines
            pointRadius: 3,
            tension: 0.35,
            yAxisID: 'rate'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              afterBody(items) {
                const day = trendsData[items[0].dataIndex];
                return `Unique players: ${day.players || 0}`;
              }
            }
          },
          legend: { labels: { usePointStyle: true } }
        },
        scales: {
          x: { grid: { display: false } },
          count:   { beginAtZero: true, ticks: { precision: 0 }, title: { display: true, text: 'Races' } },
          seconds: { beginAtZero: true, position: 'right', title: { display: true, text: 'Seconds' }, grid: { drawOnChartArea: false } },
          rate:    { beginAtZero: true, max: 100, display: false } // hidden; podium rate shares the chart but doesn't need its own axis label
        }
      }
    });

    // --- Chart 3: Per-Race Performance (starts/wins bars, podium/win-rate lines per race level) ---
    const resDistribution = await fetch('http://localhost:3000/api/admin/race-performance');
    const { data: performanceData = [] } = await resDistribution.json();

    const ctx3 = document.getElementById('adminRaceDistributionChart').getContext('2d');
    new Chart(ctx3, {
      type: 'bar',
      data: {
        labels: performanceData.map(d => `Race ${d.race_level}`),
        datasets: [
          {
            label: 'Starts',
            data: performanceData.map(d => Number(d.starts) || 0),
            backgroundColor: chartPalette.cyan,
            borderRadius: 6,
            yAxisID: 'count'
          },
          {
            label: 'Wins',
            data: performanceData.map(d => Number(d.wins) || 0),
            backgroundColor: chartPalette.green,
            borderRadius: 6,
            yAxisID: 'count'
          },
          {
            type: 'line',
            label: 'Podium rate (%)',
            data: performanceData.map(d => Number(d.podium_rate) || 0),
            borderColor: chartPalette.yellow,
            backgroundColor: chartPalette.yellow,
            pointRadius: 4,
            tension: 0.35,
            yAxisID: 'rate'
          },
          {
            type: 'line',
            label: 'Win rate (%)',
            data: performanceData.map(d => Number(d.win_rate) || 0),
            borderColor: chartPalette.red,
            backgroundColor: chartPalette.red,
            pointRadius: 4,
            tension: 0.35,
            yAxisID: 'rate'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              afterBody(items) {
                const race = performanceData[items[0].dataIndex];
                return [`Avg time: ${race.avg_time || 'N/A'}s`, `Avg best lap: ${race.avg_fastest_lap || 'N/A'}s`];
              }
            }
          },
          legend: { labels: { usePointStyle: true } }
        },
        scales: {
          x: { grid: { display: false } },
          count: { beginAtZero: true, ticks: { precision: 0 }, title: { display: true, text: 'Races' } },
          rate: {
            beginAtZero: true,
            max: 100,
            position: 'right',
            ticks: { color: chartPalette.yellow, callback: value => `${value}%` },
            grid: { drawOnChartArea: false }
          }
        }
      }
    });

  } catch (error) {
    console.error("Error loading admin analytics:", error);
  }
}
