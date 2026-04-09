import TRAINER from "../trainer.config.js";
import { fetchPokemon } from "./api.js";
import { renderPokemon, renderSkeleton } from "./render.js";

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

// 🔥 NUEVO: timeout helper
function fetchWithTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("timeout")), ms)
  );
  return Promise.race([promise, timeout]);
}

// Trainer info
document.getElementById("trainer-name").textContent = `🎒 ${TRAINER.name}`;
document.getElementById("trainer-town").textContent = `🌳 ${TRAINER.hometown}`;
document.getElementById("trainer-phrase").textContent = `💬 ${TRAINER.catchphrase}`;

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

// 🔥 Load player (igual)
async function loadPlayerPokemon() {
  let skeletonTimeout;

  try {
    skeletonTimeout = setTimeout(() => {
      state.loadingPlayer = true;
      render();
    }, 200);

    const data = await fetchPokemon(TRAINER.favoritePokemon.toLowerCase());

    clearTimeout(skeletonTimeout);

    state.player = data;

  } catch {
    playerCardEl.innerHTML = `<p>Error cargando tu Pokémon</p>`;
  } finally {
    state.loadingPlayer = false;
    render();
  }
}

// 🔥 Search opponent
async function searchOpponent(name) {
  if (!name) {
    state.opponent = null;
    state.errorOpponent = null;

    opponentCardEl.innerHTML = `<p class="loading">Busca un Pokémon...</p>`;
    opponentCardEl.style.backgroundColor = "#1e293b";

    render();
    return;
  }

  let start;

  try {
    if (controller) controller.abort();
    controller = new AbortController();

    state.errorOpponent = null;

    // Mostrar skeleton INMEDIATO
    state.loadingOpponent = true;
    render();

    start = Date.now();

    const data = await fetchWithTimeout(
      fetchPokemon(name, controller.signal),
      2000
    );

    const elapsed = Date.now() - start;

    // Asegurar mínimo tiempo del skeleton
    if (elapsed < 400) {
      await new Promise(res => setTimeout(res, 400 - elapsed));
    }

    state.opponent = data;

    localStorage.setItem("lastOpponent", name);

  } catch (error) {
    if (error.name === "AbortError") return;

    const elapsed = Date.now() - start;

    if (elapsed < 400) {
      await new Promise(res => setTimeout(res, 400 - elapsed));
    }

    state.errorOpponent = "¿Quién es ese Pokémon?";
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
    searchOpponent(e.target.value.trim().toLowerCase());
  }, 400);
});

// 🔹 Estado inicial del oponente
function loadInitialOpponent() {
  state.opponent = null;
  state.errorOpponent = null;
  opponentCardEl.innerHTML = `<p class="loading">Busca un Pokémon...</p>`;
  opponentCardEl.style.backgroundColor = "#1e293b";
  render();
}

// Botón
battleBtn.addEventListener("click", () => {
  localStorage.setItem("playerPokemon", JSON.stringify(state.player));
  localStorage.setItem("opponentPokemon", JSON.stringify(state.opponent));

  window.location.href = "../stage-2/index.html";
});

// Init
loadPlayerPokemon();
loadInitialOpponent();