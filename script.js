const input = document.getElementById("teamInput");
const button = document.getElementById("searchBtn");
const result = document.getElementById("result");
const loader = document.getElementById("loader");

button.addEventListener("click", () => {
  const teamName = input.value.trim();

  if (teamName === "") {
    alert("Please enter a team name");
    return;
  }

  fetchTeam(teamName);
});

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
      result.innerHTML = "No team found";
      return;
    }

    displayTeam(data.teams[0]);
  } catch (error) {
    loader.style.display = "none";
    result.innerHTML = "Error fetching data";
    console.error(error);
  }
}

function displayTeam(team) {
  result.innerHTML = `
    <h2>${team.strTeam}</h2>
    <img src="${team.strTeamBadge}" 
     alt="Team Logo" 
     width="150"
     onerror="this.src='https://via.placeholder.com/150?text=No+Logo'" />   
    <p><strong>League:</strong> ${team.strLeague}</p>
    <p><strong>Country:</strong> ${team.strCountry}</p>
    <p><strong>Stadium:</strong> ${team.strStadium}</p>
    <p>${team.strDescriptionEN || "No description available"}</p>  `;
}