import TRAINER from "../trainer.config.js";
import { fetchPokemon, getValidMoves, fetchMovesDetails } from "./api.js";
import { renderPokemon, renderSkeleton } from "./render.js";

const playerCardEl = document.getElementById("player-card");
const opponentCardEl = document.getElementById("opponent-card");
const searchInput = document.getElementById("search");
const battleBtn = document.getElementById("battle-btn");

const state = { player: null, opponent: null, loadingPlayer: false, loadingOpponent: false, playerRendered: false };
let abortController = null;

function render() {
    if (state.loadingPlayer) renderSkeleton(playerCardEl);
    else if (state.player && !state.playerRendered) {
        renderPokemon(state.player, playerCardEl);
        state.playerRendered = true; 
    }

    if (state.loadingOpponent) renderSkeleton(opponentCardEl);
    else if (state.opponent) renderPokemon(state.opponent, opponentCardEl);

    battleBtn.disabled = !(state.player && state.opponent);
}

async function init() {
    document.getElementById("trainer-name").textContent = `🎒 ${TRAINER.name}`;
    document.getElementById("trainer-town").textContent = `🌳 ${TRAINER.hometown}`;
    document.getElementById("trainer-phrase").textContent = `💬 ${TRAINER.catchphrase}`;

    state.loadingPlayer = true;
    render();
    
    try {
        const data = await fetchPokemon(TRAINER.favoritePokemon.toLowerCase());
        const moves = getValidMoves(data);
        const moveDetails = await fetchMovesDetails(moves);
        state.player = { ...data, movesInfo: moveDetails };
    } catch (e) { console.error("Error inicial:", e); }
    finally {
        state.loadingPlayer = false;
        render();
        const savedOpponent = localStorage.getItem("lastOpponent");
        if (savedOpponent) {
            searchInput.value = savedOpponent;
            searchInput.dispatchEvent(new Event('input')); 
        }
    }
}

let debounce;
searchInput.addEventListener("input", (e) => {
    if (abortController) abortController.abort();
    abortController = new AbortController();
    clearTimeout(debounce);
    const val = e.target.value.trim().toLowerCase();

    if (!val) {
        state.opponent = null;
        opponentCardEl.style.backgroundColor = '';
        opponentCardEl.innerHTML = `<div class="empty-state"><p>Busca un Pokémon...</p></div>`;
        battleBtn.disabled = true;
        return;
    }

    state.loadingOpponent = true;
    renderSkeleton(opponentCardEl);

    debounce = setTimeout(async () => {
        try {
            const data = await fetchPokemon(val, abortController.signal);
            const moves = getValidMoves(data);
            const moveDetails = await fetchMovesDetails(moves, abortController.signal);
            state.opponent = { ...data, movesInfo: moveDetails };
            state.loadingOpponent = false;
            localStorage.setItem("lastOpponent", val);
            render();
        } catch (error) {
            if (error.name === 'AbortError') return;
            state.loadingOpponent = false;
            state.opponent = null;
            opponentCardEl.style.backgroundColor = '';
            opponentCardEl.innerHTML = `<div class="error-state"><p class="who-is">¿Quién es ese Pokémon?</p></div>`;
            battleBtn.disabled = true;
        }
    }, 400);
});

battleBtn.addEventListener("click", () => {
    localStorage.setItem("battleData", JSON.stringify({ player: state.player, opponent: state.opponent }));
    window.location.href = "../stage-2/index.html"; 
});

init();