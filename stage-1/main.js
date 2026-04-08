import TRAINER from "../trainer.config.js";
import { fetchPokemon, delay } from "./api.js";
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

// AbortController (para cancelar búsquedas anteriores)
let controller = null;

// Trainer info
document.getElementById("trainer-name").textContent = `👤 ${TRAINER.name}`;
document.getElementById("trainer-town").textContent = `📍 ${TRAINER.hometown}`;
document.getElementById("trainer-phrase").textContent = `💬 ${TRAINER.catchphrase}`;

// 🔄 RENDER CENTRAL (TODO pasa por aquí)
function render() {
  // PLAYER
  if (state.loadingPlayer) {
    renderSkeleton(playerCardEl);
  } else if (state.player) {
    renderPokemon(state.player, playerCardEl);
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

// 🔥 CARGAR POKÉMON DEL PLAYER
async function loadPlayerPokemon() {
  try {
    state.loadingPlayer = true;
    render();

    const data = await fetchPokemon(TRAINER.favoritePokemon.toLowerCase());
    await delay(600); // efecto visual

    state.player = data;

  } catch (error) {
    playerCardEl.innerHTML = `<p>Error cargando tu Pokémon</p>`;
  } finally {
    state.loadingPlayer = false;
    render();
  }
}

// 🔎 BUSCAR OPONENTE (CORREGIDO)
async function searchOpponent(name) {
  if (!name) {
    state.opponent = null;
    state.errorOpponent = null;
    render();
    return;
  }

  try {
    // Cancelar búsqueda anterior
    if (controller) controller.abort();
    controller = new AbortController();

    state.loadingOpponent = true;
    state.errorOpponent = null;
    render();

    const data = await fetchPokemon(name, controller.signal);
    await delay(600);

    state.opponent = data;

    // Guardar en localStorage
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

// ⏱️ DEBOUNCE (400ms)
let debounceTimeout;

searchInput.addEventListener("input", (e) => {
  clearTimeout(debounceTimeout);

  debounceTimeout = setTimeout(() => {
    searchOpponent(e.target.value.trim().toLowerCase());
  }, 400);
});

// 🔁 CARGAR ÚLTIMO OPONENTE
function loadLastOpponent() {
  const last = localStorage.getItem("lastOpponent");

  if (last) {
    searchInput.value = last;
    searchOpponent(last);
  }
}

// ⚔️ BOTÓN IR A BATALLA
battleBtn.addEventListener("click", () => {
  localStorage.setItem("playerPokemon", JSON.stringify(state.player));
  localStorage.setItem("opponentPokemon", JSON.stringify(state.opponent));

  window.location.href = "../stage-2/index.html";
});

// 🚀 INIT
loadPlayerPokemon();
loadLastOpponent();