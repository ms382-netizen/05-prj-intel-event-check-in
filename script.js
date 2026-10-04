// ---------- Config ----------
const GOAL = 50;
const STORAGE_KEY = "intelSummitCheckIn";

const TEAM_NAMES = {
  water: "Team Water Wise",
  zero: "Team Net Zero",
  power: "Team Renewables",
};

// ---------- Element references (adjust IDs if your starter differs) ----------
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const greeting = document.getElementById("greeting");
const attendeeCountEl = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const teamCountEls = {
  water: document.getElementById("waterCount"),
  zero: document.getElementById("zeroCount"),
  power: document.getElementById("powerCount"),
};

// Attendee list container: use the one in the HTML, or create it
let attendeeListEl = document.getElementById("attendeeList");
if (!attendeeListEl) {
  attendeeListEl = document.createElement("ul");
  attendeeListEl.id = "attendeeList";
  attendeeListEl.className = "attendee-list";
  document.querySelector(".team-stats").appendChild(attendeeListEl);
}

// ---------- State ----------
let state = {
  count: 0,
  teams: { water: 0, zero: 0, power: 0 },
  attendees: [], // { name, team }
  celebrated: false,
};

// ---------- Local storage ----------
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Could not save progress:", e);
  }
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && typeof saved.count === "number") {
      state = { ...state, ...saved, teams: { ...state.teams, ...saved.teams } };
    }
  } catch (e) {
    console.error("Could not load progress:", e);
  }
}

// ---------- Rendering ----------
function render() {
  attendeeCountEl.textContent = state.count;

  for (const key in teamCountEls) {
    if (teamCountEls[key]) teamCountEls[key].textContent = state.teams[key];
  }

  const percent = Math.min(100, Math.round((state.count / GOAL) * 100));
  progressBar.style.width = percent + "%";

  attendeeListEl.innerHTML = "";
  state.attendees.forEach((a) => {
    const li = document.createElement("li");
    li.textContent = `${a.name} — ${TEAM_NAMES[a.team]}`;
    attendeeListEl.appendChild(li);
  });

  if (state.celebrated) showCelebration();
}

function getWinner() {
  const entries = Object.entries(state.teams);
  const max = Math.max(...entries.map(([, n]) => n));
  const winners = entries
    .filter(([, n]) => n === max)
    .map(([k]) => TEAM_NAMES[k]);
  return winners.length > 1 ? winners.join(" & ") + " (tie)" : winners[0];
}

function showCelebration() {
  greeting.textContent = `🎉 Goal reached! ${getWinner()} wins with the highest turnout!`;
  greeting.style.display = "block";
}

// ---------- Check-in ----------
form.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = nameInput.value.trim();
  const team = teamSelect.value;

  if (!name || !TEAM_NAMES[team]) {
    greeting.textContent = "Please enter your name and choose a team.";
    greeting.style.display = "block";
    return;
  }

  state.count++;
  state.teams[team]++;
  state.attendees.push({ name, team });

  if (state.count >= GOAL) state.celebrated = true;

  saveState();
  render();

  if (state.celebrated) {
    showCelebration();
  } else {
    greeting.textContent = `Welcome, ${name} from ${TEAM_NAMES[team]}! 🌱`;
    greeting.style.display = "block";
  }

  form.reset();
});

// ---------- Init ----------
loadState();
render();
