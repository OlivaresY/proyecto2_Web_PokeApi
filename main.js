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


//Emojis y funciones auxiliares
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

//Renderizado del pokemon
async function renderPokemonInfo(data, container, isPlayer = false) {
  const name = data.name.charAt(0).toUpperCase() + data.name.slice(1);
  const type = data.types[0].type.name;
  const emoji = typeEmoji(type);
  const hp = data.stats.find(s => s.stat.name === "hp")?.base_stat || "?";
  const power = data.stats.find(s => s.stat.name === "attack")?.base_stat || "?";
  const defense = data.stats.find(s => s.stat.name === "defense")?.base_stat || "?";
  const energy = data.stats.find(s => s.stat.name === "speed")?.base_stat || "?";
  const sprite = data.sprites.front_default || "";

  //Aplica color de fondo según tipo
  container.style.backgroundColor = typeColor(type);

  //Render básico
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
      <p>Cargando moves...</p>
    </div>
  `;

  if (isPlayer) {
    //Cargar y mostrar las 3 primeras moves
    const moveContainer = container.querySelector(".pokemon-moves");
    const moves = data.moves.slice(0, 3); // primeras 3 moves
    const moveDetails = await Promise.allSettled(
      moves.map(async move => {
        const res = await fetch(move.move.url);
        if (!res.ok) throw new Error("Error cargando move");
        return await res.json();
      })
    );

    moveContainer.innerHTML = "<p><strong>Moves:</strong></p>";
    const ul = document.createElement("ul");
    moveDetails.forEach((result, index) => {
      if (result.status === "fulfilled") {
        const move = result.value;
        const moveName = move.name.charAt(0).toUpperCase() + move.name.slice(1);
        const moveType = move.type.name;
        const li = document.createElement("li");
        li.textContent = `${moveName} ${typeEmoji(moveType)}`;
        li.style.color = typeColor(moveType);
        ul.appendChild(li);
      } else {
        const li = document.createElement("li");
        li.textContent = `${moves[index].move.name} ❓`;
        ul.appendChild(li);
      }
    });
    moveContainer.appendChild(ul);
  }
}


//Carga el pokemon del jugador
async function loadPlayerPokemon() {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${TRAINER.favoritePokemon.toLowerCase()}`);
    if (!res.ok) throw new Error("Error cargando Pokémon favorito");
    const data = await res.json();
    renderPokemonInfo(data, playerCardEl, true);
    battleBtn.disabled = true; // espera a oponente
  } catch (err) {
    playerCardEl.innerHTML = `<p>Error cargando tu Pokémon.</p>`;
  }
}

//EStado del oponente
let opponentData = null;

//Busqueda del oponente
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
    battleBtn.disabled = false; // ambos Pokémon listos
  } catch {
    opponentCardEl.innerHTML = `<p class="loading">Pokémon no encontrado</p>`;
    battleBtn.disabled = true;
    opponentData = null;
  }
}

//DEBOUNCE para la busqueda
let debounceTimeout;
searchInput.addEventListener("input", (e) => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    const value = e.target.value.trim();
    searchOpponent(value);
  }, 400);
});

//Precarga ultimo oponente
const lastOpponent = localStorage.getItem("lastOpponent");
if (lastOpponent) {
  searchInput.value = lastOpponent;
  searchOpponent(lastOpponent);
}


//Boton de batalla
battleBtn.addEventListener("click", () => {
  if (!opponentData) return;
  // Guardar datos para Stage 2
  localStorage.setItem("playerPokemon", JSON.stringify(TRAINER.favoritePokemon));
  localStorage.setItem("opponentPokemon", JSON.stringify(opponentData.name));
  localStorage.setItem("lastOpponent", opponentData.name);
  // Redirigir a Stage 2
  window.location.href = "../stage-2/index.html";
});

//Inicializa pokemon
loadPlayerPokemon();