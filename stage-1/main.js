import TRAINER from "../trainer.config.js";
import { fetchPokemon, getValidMoves, fetchMovesDetails } from "./api.js";
import { renderPokemon, renderSkeleton } from "./render.js";

const playerCardEl = document.getElementById("player-card");
const opponentCardEl = document.getElementById("opponent-card");
const searchInput = document.getElementById("search");
const battleBtn = document.getElementById("battle-btn");

const oppName = document.getElementById("opponent-name");
const oppTown = document.getElementById("opponent-town");
const oppPhrase = document.getElementById("opponent-phrase");

const state = { player: null, opponent: null, loadingPlayer: false, loadingOpponent: false, playerRendered: false };
let abortController = null;

function render() {
    if (state.loadingPlayer) renderSkeleton(playerCardEl);
    else if (state.player && !state.playerRendered) {
        renderPokemon(state.player, playerCardEl);
        state.playerRendered = true; 
    }

    // Aquí es donde se recupera el efecto Shine
    if (state.loadingOpponent) renderSkeleton(opponentCardEl);
    else if (state.opponent) renderPokemon(state.opponent, opponentCardEl);

    battleBtn.disabled = !(state.player && state.opponent && !state.loadingOpponent);
}

async function init() {
    localStorage.removeItem("battleData");

    document.getElementById("trainer-name").textContent = `🎒 ${TRAINER.name}`;
    document.getElementById("trainer-town").textContent = `🌳 ${TRAINER.hometown}`;
    document.getElementById("trainer-phrase").textContent = `💬 ${TRAINER.catchphrase}`;

    if(oppName) oppName.textContent = "🎒 DESCONOCIDO";
    if(oppTown) oppTown.textContent = "🌳 DESCONOCIDO";
    if(oppPhrase) oppPhrase.textContent = "💬 DESCONOCIDO";

    state.loadingPlayer = true;
    render();
    
    try {
        const data = await fetchPokemon(TRAINER.favoritePokemon.toLowerCase());
        const moves = getValidMoves(data);
        const moveDetails = await fetchMovesDetails(moves);
        state.player = { ...data, movesInfo: moveDetails };
    } catch (e) { 
        console.error(e); 
    } finally {
        state.loadingPlayer = false;
        render();
        searchInput.value = ""; 
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
        state.loadingOpponent = false; 
        opponentCardEl.style.backgroundColor = '';
        opponentCardEl.innerHTML = `<div class="empty-state"><p>Busca un Pokémon...</p></div>`;
        battleBtn.disabled = true;
        return;
    }

    // --- EL CAMBIO PRECISO: Activamos carga y dibujamos el skeleton inmediatamente ---
    state.loadingOpponent = true;
    render(); 
    battleBtn.disabled = true; 

    debounce = setTimeout(async () => {
        try {
            const data = await fetchPokemon(val, abortController.signal);
            const moves = getValidMoves(data);
            const moveDetails = await fetchMovesDetails(moves, abortController.signal);
            
            state.opponent = { ...data, movesInfo: moveDetails };
            state.loadingOpponent = false;
            render(); // Quitamos el skeleton y ponemos al Pokémon encontrado
        } catch (error) {
            if (error.name === 'AbortError') return;
            state.loadingOpponent = false;
            state.opponent = null;
            opponentCardEl.innerHTML = `<div class="error-state"><p class="who-is">¿Quién es ese Pokémon?</p></div>`;
            battleBtn.disabled = true;
        }
    }, 800); 
});

battleBtn.addEventListener("click", () => {
    if (!state.player || !state.opponent) return;

    const cleanPlayerMoves = state.player.movesInfo.map(res => res.value || res);
    const cleanOpponentMoves = state.opponent.movesInfo.map(res => res.value || res);

    const battleData = { 
        player: { ...state.player, movesInfo: cleanPlayerMoves }, 
        opponent: { ...state.opponent, movesInfo: cleanOpponentMoves } 
    };

    localStorage.setItem("battleData", JSON.stringify(battleData));
    window.location.href = "./stage-2/index.html"; 
});

init();