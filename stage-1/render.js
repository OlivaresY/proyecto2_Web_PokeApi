import TRAINER from "../trainer.config.js";
import { fetchPokemon } from "./api.js";
import { renderPokemon, renderSkeleton } from "./render.js";

const playerCardEl = document.getElementById("player-card");
const opponentCardEl = document.getElementById("opponent-card");
const searchInput = document.getElementById("search");
const battleBtn = document.getElementById("battle-btn");

const state = {
  player: null,
  opponent: null,
  loadingPlayer: false,
  loadingOpponent: false,
  playerRendered: false 
};

function render() {
  if (state.loadingPlayer) {
    renderSkeleton(playerCardEl);
  } else if (state.player && !state.playerRendered) {
    renderPokemon(state.player, playerCardEl);
    state.playerRendered = true; 
  }

  if (state.loadingOpponent) {
    renderSkeleton(opponentCardEl);
  } else if (state.opponent) {
    renderPokemon(state.opponent, opponentCardEl);
  }

  battleBtn.disabled = !(state.player && state.opponent);
}

async function init() {
  document.getElementById("trainer-name").textContent = `🎒 ${TRAINER.name}`;
  document.getElementById("trainer-town").textContent = `🌳 ${TRAINER.hometown}`;
  document.getElementById("trainer-phrase").textContent = `💬 ${TRAINER.catchphrase}`;

  state.loadingPlayer = true;
  render();
  state.player = await fetchPokemon(TRAINER.favoritePokemon.toLowerCase());
  state.loadingPlayer = false;
  render();
}

let debounce;
searchInput.addEventListener("input", (e) => {
  clearTimeout(debounce);
  const val = e.target.value.trim().toLowerCase();

  if (!val) {
    state.opponent = null;
    state.loadingOpponent = false;
    opponentCardEl.style.backgroundColor = ""; 
    opponentCardEl.classList.remove("dynamic-bg");
    opponentCardEl.innerHTML = `<div class="empty-state"><p>Busca un Pokémon...</p></div>`;
    battleBtn.disabled = true;
    return;
  }

  state.loadingOpponent = true;
  render();

  debounce = setTimeout(async () => {
    try {
      state.opponent = await fetchPokemon(val);
      state.loadingOpponent = false;
      render();
    } catch {
      state.loadingOpponent = false;
      state.opponent = null;
      opponentCardEl.style.backgroundColor = "";
      opponentCardEl.classList.remove("dynamic-bg");
      opponentCardEl.innerHTML = `<div class="error-state"><p class="who-is">¿Quién es ese Pokémon?</p></div>`;
      battleBtn.disabled = true;
    }
  }, 400);
});

init();