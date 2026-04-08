import TRAINER from "./trainer.config.js";

// DOM
const playerCardEl = document.getElementById("player-card");
const opponentCardEl = document.getElementById("opponent-card");
const searchInput = document.getElementById("search");
const battleBtn = document.getElementById("battle-btn");

// STATE GLOBAL
const state = {
  player: null,
  opponent: null,
  loadingPlayer: false,
  loadingOpponent: false,
  errorOpponent: null
};

// AbortController
let controller = null;

// Trainer info
document.getElementById("trainer-name").textContent = TRAINER.name;
document.getElementById("trainer-town").textContent = TRAINER.hometown;
document.getElementById("trainer-phrase").textContent = TRAINER.catchphrase;

// Emojis
const typeEmoji = (type) => ({
  electric: "⚡",
  water: "💧",
  fire: "🔥",
  grass: "🌿",
  ice: "❄️",
  fighting: "🥊",
  poison: "☠️",
  ground: "🌍",
  flying: "🕊️",
  psychic: "🔮",
  bug: "🐛",
  rock: "🪨",
  ghost: "👻",
  dragon: "🐉",
  dark: "🌑",
  steel: "⚙️",
  fairy: "✨",
  normal: "⬜"
}[type] || "❓");

// Colores
const typeColor = (type) => ({
  electric: "#f9e045",
  water: "#3da4f7",
  fire: "#f75c03",
  grass: "#63c74d",
  ice: "#9de0ff",
  fighting: "#d56723",
  poison: "#b97fc9",
  ground: "#e0c068",
  flying: "#a890f0",
  psychic: "#f85888",
  bug: "#a8b820",
  rock: "#b8a038",
  ghost: "#705898",
  dragon: "#7038f8",
  dark: "#705848",
  steel: "#b8b8d0",
  fairy: "#f4bdc9",
  normal: "#a8a878"
}[type] || "#777");

// Skeleton
function renderSkeleton(container) {
  container.innerHTML = `
    <div class="skeleton skeleton-img"></div>
    <div class="skeleton skeleton-text"></div>
    <div class="skeleton skeleton-text"></div>
  `;
}

// Moves
async function getMovesDetails(moves) {
  return await Promise.allSettled(
    moves.map(move => fetch(move.move.url).then(res => res.json()))
  );
}

// RENDER CENTRAL
function render() {

  // PLAYER
  if (state.loadingPlayer) {
    renderSkeleton(playerCardEl);
  } else if (state.player) {
    renderPokemon(state.player, playerCardEl, true);
  }

  // OPPONENT
  if (state.loadingOpponent) {
    renderSkeleton(opponentCardEl);
  } else if (state.errorOpponent) {
    opponentCardEl.innerHTML = `<p>${state.errorOpponent}</p>`;
  } else if (state.opponent) {
    renderPokemon(state.opponent, opponentCardEl);
  }

  // BOTÓN
  battleBtn.disabled = !(state.player && state.opponent);
}

// Render Pokemon
async function renderPokemon(data, container, isPlayer = false) {
  const type = data.types[0].type.name;

  container.classList.add("dynamic-bg");
  container.style.backgroundColor = typeColor(type);

  container.innerHTML = `
    <img src="${data.sprites.front_default}" class="pokemon-sprite">
    <p><strong>${data.name} ${typeEmoji(type)}</strong></p>
    <p>HP: ${data.stats.find(s => s.stat.name === "hp").base_stat}</p>
    <div class="moves-buttons"></div>
  `;

  const movesContainer = container.querySelector(".moves-buttons");
  const moves = data.moves.slice(0, 3);

  const results = await getMovesDetails(moves);

  results.forEach((res, i) => {
    const btn = document.createElement("button");
    btn.className = "move-btn";

    if (res.status === "fulfilled") {
      btn.textContent = res.value.name;
      btn.classList.add(res.value.type.name);
    } else {
      btn.textContent = moves[i].move.name;
      btn.classList.add("unknown");
    }

    movesContainer.appendChild(btn);
  });
}

// Load player
async function loadPlayerPokemon() {
  try {
    state.loadingPlayer = true;
    render();

    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${TRAINER.favoritePokemon}`);
    state.player = await res.json();

  } catch {
    playerCardEl.innerHTML = `<p>Error cargando tu Pokémon</p>`;
  } finally {
    state.loadingPlayer = false;
    render();
  }
}

// Search opponent
async function searchOpponent(name) {
  if (!name) return;

  try {
    if (controller) controller.abort();
    controller = new AbortController();

    state.loadingOpponent = true;
    state.errorOpponent = null;
    render();

    const res = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${name}`,
      { signal: controller.signal }
    );

    const data = await res.json();

    state.opponent = data;

    // Guardar último oponente
    localStorage.setItem("lastOpponent", name);

  } catch (error) {
    if (error.name === "AbortError") return;

    state.errorOpponent = "Pokémon no encontrado";
    state.opponent = null;

  } finally {
    state.loadingOpponent = false;
    render();
  }
}

// Debounce
let debounceTimeout;

searchInput.addEventListener("input", (e) => {
  clearTimeout(debounceTimeout);

  debounceTimeout = setTimeout(() => {
    searchOpponent(e.target.value.trim());
  }, 400);
});

// Cargar último oponente
function loadLastOpponent() {
  const last = localStorage.getItem("lastOpponent");

  if (last) {
    searchInput.value = last;
    searchOpponent(last);
  }
}

// 🔥 BOTÓN → GUARDAR PARA STAGE 2
battleBtn.addEventListener("click", () => {
  localStorage.setItem("playerPokemon", JSON.stringify(state.player));
  localStorage.setItem("opponentPokemon", JSON.stringify(state.opponent));

  window.location.href = "../stage-2/index.html";
});

// Init
loadPlayerPokemon();
loadLastOpponent();