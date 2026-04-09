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

    if (state.loadingOpponent) renderSkeleton(opponentCardEl);
    else if (state.opponent) renderPokemon(state.opponent, opponentCardEl);

    //El boton solo se activa si hay ambos Pokemon y no se esta cargando nada
    battleBtn.disabled = !(state.player && state.opponent && !state.loadingOpponent);
}

async function init() {
    // Limpieza de datos de batalla anteriores
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
        
        //Al reiniciar la pagina, aseguramos que el buscador este vacío
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
        if(oppName) oppName.textContent = "🎒 DESCONOCIDO";
        if(oppTown) oppTown.textContent = "🌳 DESCONOCIDO";
        if(oppPhrase) oppPhrase.textContent = "💬 DESCONOCIDO";
        battleBtn.disabled = true;
        return;
    }

    state.loadingOpponent = true;
    renderSkeleton(opponentCardEl);
    battleBtn.disabled = true; 

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
    }, 800); 
});

battleBtn.addEventListener("click", () => {
    if (!state.player || !state.opponent) return;

    //Limpieza de movimientos: Extraemos solo el valor de las promesas cumplidas
    const cleanPlayerMoves = state.player.movesInfo
        .filter(res => res.status === "fulfilled")
        .map(res => res.value);

    const cleanOpponentMoves = state.opponent.movesInfo
        .filter(res => res.status === "fulfilled")
        .map(res => res.value);

    //Guardamos los datos optimizados para que la Stage 2 sea más directa
    localStorage.setItem("battleData", JSON.stringify({ 
        player: { ...state.player, movesInfo: cleanPlayerMoves }, 
        opponent: { ...state.opponent, movesInfo: cleanOpponentMoves } 
    }));

    window.location.href = "../stage-2/index.html"; 
});

init();