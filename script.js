const input = document.getElementById("teamInput");
const leagueFilter = document.getElementById("leagueFilter");
const sortOption = document.getElementById("sortOption");
const button = document.getElementById("searchBtn");
const result = document.getElementById("result");
const loader = document.getElementById("loader");
const favoritesContainer = document.getElementById("favoritesContainer");

let allTeamsData = [];
let favorites = JSON.parse(localStorage.getItem('futbolFavorites')) || [];

function toggleFavorite(teamId) {
  const index = favorites.findIndex(t => t.idTeam === teamId);
  if (index !== -1) {
    favorites.splice(index, 1);
  } else {
    // Find team in allTeamsData
    const teamObj = allTeamsData.find(t => t.idTeam === teamId) || favorites.find(t => t.idTeam === teamId);
    if (teamObj) {
      favorites.push(teamObj);
    }
  }
  localStorage.setItem('futbolFavorites', JSON.stringify(favorites));
  renderFavorites();
  applyFilters(); // Re-render search results to update stars
}

function renderFavorites() {
  if (favorites.length === 0) {
    favoritesContainer.innerHTML = "";
    return;
  }
  
  favoritesContainer.innerHTML = `
    <h2 class="section-title">⭐ Your Favorites</h2>
    <div class="teams-grid">
      ${favorites.map(team => createTeamCardHTML(team)).join('')}
    </div>
    <hr class="divider" />
  `;
}

function applyFilters() {
  const searchTerm = input.value.trim().toLowerCase();
  const selectedLeague = leagueFilter.value;
  const sortBy = sortOption.value;
  
  if (allTeamsData && allTeamsData.length > 0) {
    let filteredTeams = allTeamsData.filter(team => {
      const matchesSearch = team.strTeam.toLowerCase().includes(searchTerm);
      const matchesLeague = selectedLeague === "" || team.strLeague === selectedLeague;
      return matchesSearch && matchesLeague;
    });

    if (sortBy === "nameAsc") {
      filteredTeams.sort((a, b) => (a.strTeam || "").localeCompare(b.strTeam || ""));
    } else if (sortBy === "nameDesc") {
      filteredTeams.sort((a, b) => (b.strTeam || "").localeCompare(a.strTeam || ""));
    } else if (sortBy === "countryAsc") {
      filteredTeams.sort((a, b) => (a.strCountry || "").localeCompare(b.strCountry || ""));
    } else if (sortBy === "countryDesc") {
      filteredTeams.sort((a, b) => (b.strCountry || "").localeCompare(a.strCountry || ""));
    }

    displayTeams(filteredTeams);
  }
}

function updateLeagueDropdown(teams) {
  const currentSelection = leagueFilter.value;
  const leagues = new Set(teams.map(team => team.strLeague).filter(Boolean));
  
  leagueFilter.innerHTML = '<option value="">All Leagues</option>';
  
  Array.from(leagues).sort().forEach(league => {
    const option = document.createElement("option");
    option.value = league;
    option.textContent = league;
    leagueFilter.appendChild(option);
  });
  
  // Restore selection if it still exists
  if (leagues.has(currentSelection)) {
    leagueFilter.value = currentSelection;
  }
}

button.addEventListener("click", () => {
  const teamName = input.value.trim();

  if (teamName === "") {
    alert("Please enter a team name");
    return;
  }

  fetchTeam(teamName);
});

input.addEventListener("input", applyFilters);
leagueFilter.addEventListener("change", applyFilters);
sortOption.addEventListener("change", applyFilters);

async function fetchTeam(team) {
  loader.style.display = "block";
  result.innerHTML = "";

  try {
    const res = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${team}`
    );

    const data = await res.json();

    loader.style.display = "none";

    if (!data.teams) {
      allTeamsData = [];
      updateLeagueDropdown([]);
      result.innerHTML = "<p class='error-msg'>No teams found. Please try another search.</p>";
      return;
    }

    allTeamsData = data.teams;
    updateLeagueDropdown(allTeamsData);
    applyFilters();
  } catch (error) {
    loader.style.display = "none";
    allTeamsData = [];
    updateLeagueDropdown([]);
    result.innerHTML = "<p class='error-msg'>Error fetching data. Please try again later.</p>";
    console.error(error);
  }
}

function createTeamCardHTML(team) {
  const isFav = favorites.some(f => f.idTeam === team.idTeam);
  return `
    <div class="team-card">
      <div class="card-glass-panel">
        <button class="fav-btn ${isFav ? 'active' : ''}" onclick="toggleFavorite('${team.idTeam}')">
          ${isFav ? '★' : '☆'}
        </button>
        <div class="logo-wrapper">
          <img src="${team.strTeamBadge || `https://ui-avatars.com/api/?name=${encodeURIComponent(team.strTeam)}&background=141c2f&color=00ffcc&size=150`}" 
           alt="${team.strTeam} Logo" 
           onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(team.strTeam)}&background=141c2f&color=00ffcc&size=150';" />
        </div>
        <div class="card-content">
          <h2>${team.strTeam}</h2>
          <div class="info-row">
            <span class="info-label">League</span>
            <span class="info-value">${team.strLeague}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Country</span>
            <span class="info-value">${team.strCountry}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Stadium</span>
            <span class="info-value">${team.strStadium || 'Unknown'}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function displayTeams(teams) {
  if (teams.length === 0) {
    result.innerHTML = "<p class='error-msg'>No teams match your filters.</p>";
    return;
  }
  result.innerHTML = `<div class="teams-grid">` + 
    teams.map(team => createTeamCardHTML(team)).join('') + `</div>`;
}

// Initial render of favorites
renderFavorites();