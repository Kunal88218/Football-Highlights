const input = document.getElementById("teamInput");
const leagueFilter = document.getElementById("leagueFilter");
const button = document.getElementById("searchBtn");
const result = document.getElementById("result");
const loader = document.getElementById("loader");

let allTeamsData = [];

function applyFilters() {
  const searchTerm = input.value.trim().toLowerCase();
  const selectedLeague = leagueFilter.value;
  
  if (allTeamsData && allTeamsData.length > 0) {
    const filteredTeams = allTeamsData.filter(team => {
      const matchesSearch = team.strTeam.toLowerCase().includes(searchTerm);
      const matchesLeague = selectedLeague === "" || team.strLeague === selectedLeague;
      return matchesSearch && matchesLeague;
    });
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

function displayTeams(teams) {
  result.innerHTML = `<div class="teams-grid">` + 
    teams.map(team => `
      <div class="team-card">
        <div class="card-glass-panel">
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
    `).join('') + `</div>`;
}