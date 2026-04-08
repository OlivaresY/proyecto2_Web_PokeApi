import TRAINER from "../trainer.config.js";


//Datos del entrenador
document.getElementById("trainer-name").textContent = TRAINER.name;
document.getElementById("trainer-town").textContent = TRAINER.hometown;
document.getElementById("trainer-phrase").textContent = TRAINER.catchphrase;

//Dom
const playerCardEl = document.getElementById("player-card");
const opponentCardEl = document.getElementById("opponent-card");
const searchInput = document.getElementById("search");
const battleBtn = document.getElementById("battle-btn");

//emojis  y funciones
function typeEmoji(type) {
  const emojis = {
    electric: "⚡",
    water: "💧",
    fire: "🔥",
    grass: "🌿",
    psychic: "🔮",
    dragon: "🐉",
    ghost: "👻",
    normal: "⬜",
  };
  return emojis[type] || "❓";
}

function heartEmoji() { return "❤️"; }

function typeColor(type) {
  const colors = {
    electric: "#f9e045",
    water: "#3da4f7",
    fire: "#f75c03",
    grass: "#63c74d",
    psychic: "#d66cfa",
    dragon: "#6a5cff",
    ghost: "#8b4f97",
    normal: "#a8a878",
  };
  return colors[type] || "#777";
}

//Renderizado de pokemon
async function renderPokemonInfo(data, container, isPlayer = false) {
  const name = data.name.charAt(0).toUpperCase() + data.name.slice(1);
  const type = data.types[0].type.name;
  const emoji = typeEmoji(type);
  const hp = data.stats.find(s => s.stat.name === "hp")?.base_stat || "?";
  const power = data.stats.find(s => s.stat.name === "attack")?.base_stat || "?";
  const defense = data.stats.find(s => s.stat.name === "defense")?.base_stat || "?";
  const energy = data.stats.find(s => s.stat.name === "speed")?.base_stat || "?";
  const sprite = data.sprites.front_default || "";

  // Fondo según tipo
  container.style.backgroundColor = typeColor(type);

  container.innerHTML = `
    <img src="${sprite}" alt="${name}" class="pokemon-sprite">
    <p><strong>${name} ${emoji}</strong></p>
    <div class="pokemon-stats">
        <span>HP: ${heartEmoji()} ${hp}</span>
        <span>Poder: ${power} ⚔️</span>
        <span>Defensa: ${defense}🛡️</span>
        <span>Energía: ${energy} 🔋</span>
    </div>
    <div class="pokemon-moves">
      <p><strong>Moves:</strong></p>
      <div class="moves-buttons"></div>
    </div>
  `;

  if (isPlayer) {
    const movesContainer = container.querySelector(".moves-buttons");
    movesContainer.innerHTML = "";

    const moves = data.moves.slice(0, 3);
    const moveDetails = await Promise.allSettled(
      moves.map(async move => {
        const res = await fetch(move.move.url);
        if (!res.ok) throw new Error("Error cargando move");
        return await res.json();
      })
    );

    moveDetails.forEach((result, index) => {
      const button = document.createElement("button");
      button.className = `move-btn`;

      if (result.status === "fulfilled") {
        const move = result.value;
        const moveName = move.name.charAt(0).toUpperCase() + move.name.slice(1);
        const moveType = move.type.name;

        button.textContent = `${moveName} ${typeEmoji(moveType)}`;
        button.classList.add(moveType);  // clase de tipo para CSS
        button.dataset.move = move.name;
      } else {
        const moveName = moves[index].move.name.charAt(0).toUpperCase() + moves[index].move.name.slice(1);
        button.textContent = `${moveName} ❓`;
        button.classList.add("unknown");
      }

      movesContainer.appendChild(button);
    });
  }
}

//Carga del pokemon jugador
async function loadPlayerPokemon() {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${TRAINER.favoritePokemon.toLowerCase()}`);
    if (!res.ok) throw new Error("Error cargando Pokémon favorito");
    const data = await res.json();
    renderPokemonInfo(data, playerCardEl, true);
    battleBtn.disabled = true;
  } catch (err) {
    playerCardEl.innerHTML = `<p>Error cargando tu Pokémon.</p>`;
  }
}

//Estado del oponente
let opponentData = null;

//busqueda del oponente
async function searchOpponent(name) {
  if (!name) {
    opponentCardEl.innerHTML = `<p class="loading">Sin seleccionar</p>`;
    battleBtn.disabled = true;
    opponentData = null;
    return;
  }

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
    if (!res.ok) throw new Error("Pokémon no encontrado");
    const data = await res.json();
    opponentData = data;
    renderPokemonInfo(data, opponentCardEl);
    battleBtn.disabled = false;
  } catch {
    opponentCardEl.innerHTML = `<p class="loading">Pokémon no encontrado</p>`;
    battleBtn.disabled = true;
    opponentData = null;
  }
}

// DEBOUNCE 
let debounceTimeout;
searchInput.addEventListener("input", (e) => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    const value = e.target.value.trim();
    searchOpponent(value);
  }, 400);
});

//Precarga ultimo pokemon
const lastOpponent = localStorage.getItem("lastOpponent");
if (lastOpponent) {
  searchInput.value = lastOpponent;
  searchOpponent(lastOpponent);
}

//Boton de batalla
battleBtn.addEventListener("click", () => {
  if (!opponentData) return;
  localStorage.setItem("playerPokemon", JSON.stringify(TRAINER.favoritePokemon));
  localStorage.setItem("opponentPokemon", JSON.stringify(opponentData.name));
  localStorage.setItem("lastOpponent", opponentData.name);
  window.location.href = "../stage-2/index.html";
});

//Inicializa pokemon del jugador
loadPlayerPokemon();