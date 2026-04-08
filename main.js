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

// Delay helper
const delay = (ms) => new Promise(res => setTimeout(res, ms));

// Emojis tipo
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

// 🔥 FILTRAR SOLO MOVES PROPIOS POR NIVEL Y ASEGURAR 4 MOVES
function getValidMoves(data) {
  const levelUpMoves = data.moves
    .filter(move =>
      move.version_group_details.some(v => v.move_learn_method.name === "level-up")
    )
    .map(move => {
      const minLevel = Math.min(
        ...move.version_group_details
          .filter(v => v.move_learn_method.name === "level-up")
          .map(v => v.level_learned_at)
      );
      return { ...move, minLevel };
    });

  levelUpMoves.sort((a, b) => a.minLevel - b.minLevel);

  return levelUpMoves.slice(-4);
}

// Moves details
async function getMovesDetails(moves) {
  return await Promise.allSettled(
    moves.map(move => fetch(move.move.url).then(res => res.json()))
  );
}

// RENDER CENTRAL
function render() {
  if (state.loadingPlayer) {
    renderSkeleton(playerCardEl);
  } else if (state.player) {
    renderPokemon(state.player, playerCardEl);
  }

  if (state.loadingOpponent) {
    renderSkeleton(opponentCardEl);
  } else if (state.errorOpponent) {
    opponentCardEl.innerHTML = `<p>${state.errorOpponent}</p>`;
  } else if (state.opponent) {
    renderPokemon(state.opponent, opponentCardEl);
  }

  battleBtn.disabled = !(state.player && state.opponent);
}

// Render Pokemon
async function renderPokemon(data, container) {
  const type = data.types[0].type.name;

  const hp = data.stats.find(s => s.stat.name === "hp").base_stat;
  const attack = data.stats.find(s => s.stat.name === "attack").base_stat;
  const defense = data.stats.find(s => s.stat.name === "defense").base_stat;
  const speed = data.stats.find(s => s.stat.name === "speed").base_stat;

  container.classList.add("dynamic-bg");
  container.style.backgroundColor = typeColor(type);

  container.innerHTML = `
    <img src="${data.sprites.front_default}" class="pokemon-sprite">
    <p><strong>${data.name} ${typeEmoji(type)}</strong></p>

    <div class="pokemon-stats">
      <span>❤️ ${hp}</span>
      <span>⚔️ ${attack}</span>
      <span>🛡️ ${defense}</span>
      <span>⚡ ${speed}</span>
    </div>

    <div class="moves-buttons"></div>
  `;

  const movesContainer = container.querySelector(".moves-buttons");

  const validMoves = getValidMoves(data);
  const results = await getMovesDetails(validMoves);

  // Siempre 4 botones
  for (let i = 0; i < 4; i++) {
    const btn = document.createElement("button");
    btn.className = "move-btn";

    if (results[i] && results[i].status === "fulfilled") {
      btn.textContent = results[i].value.name;
    } else if (validMoves[i]) {
      btn.textContent = validMoves[i].move.name;
    } else {
      btn.textContent = "-";
    }

    movesContainer.appendChild(btn);
  }
}

// Load player
async function loadPlayerPokemon() {
  try {
    state.loadingPlayer = true;
    render();

    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${TRAINER.favoritePokemon}`);
    await delay(600);

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

    await delay(600);

    const data = await res.json();

    state.opponent = data;

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

// Botón
battleBtn.addEventListener("click", () => {
  localStorage.setItem("playerPokemon", JSON.stringify(state.player));
  localStorage.setItem("opponentPokemon", JSON.stringify(state.opponent));

  window.location.href = "../stage-2/index.html";
});

// Init
loadPlayerPokemon();