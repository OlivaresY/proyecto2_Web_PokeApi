import TRAINER from "./trainer.config.js";

// DOM
const playerCardEl = document.getElementById("player-card");
const opponentCardEl = document.getElementById("opponent-card");
const searchInput = document.getElementById("search");
const battleBtn = document.getElementById("battle-btn");

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

// 🔥 NUEVO: obtener detalles de moves con Promise.allSettled
async function getMovesDetails(moves) {
  const results = await Promise.allSettled(
    moves.map(move => fetch(move.move.url).then(res => res.json()))
  );

  return results;
}

// Render Pokémon
async function renderPokemonInfo(data, container, isPlayer = false) {
  const name = data.name;
  const type = data.types[0].type.name;
  const hp = data.stats.find(s => s.stat.name === "hp").base_stat;
  const sprite = data.sprites.front_default;

  container.classList.add("dynamic-bg");
  container.style.backgroundColor = typeColor(type);

  container.innerHTML = `
    <img src="${sprite}" class="pokemon-sprite">
    <p><strong>${name} ${typeEmoji(type)}</strong></p>
    <p>HP: ${hp}</p>
    <div class="moves-buttons"></div>
  `;

  const movesContainer = container.querySelector(".moves-buttons");

  const moves = data.moves.slice(0, 3);

  // 🔥 AQUÍ USAMOS Promise.allSettled
  const movesResults = await getMovesDetails(moves);

  movesResults.forEach((result, index) => {
    const btn = document.createElement("button");
    btn.className = "move-btn";

    if (result.status === "fulfilled") {
      const move = result.value;

      btn.textContent = `${move.name} ${typeEmoji(move.type.name)}`;
      btn.classList.add(move.type.name);

    } else {
      const fallbackName = moves[index].move.name;
      btn.textContent = `${fallbackName} ❓`;
      btn.classList.add("unknown");
    }

    movesContainer.appendChild(btn);
  });
}

// Cargar Pokémon jugador
async function loadPlayerPokemon() {
  try {
    renderSkeleton(playerCardEl);

    await new Promise(res => setTimeout(res, 800));

    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${TRAINER.favoritePokemon}`);
    const data = await res.json();

    await renderPokemonInfo(data, playerCardEl, true);
  } catch {
    playerCardEl.innerHTML = `<p>Error cargando tu Pokémon</p>`;
  }
}

// Buscar oponente
async function searchOpponent(name) {
  if (!name) return;

  try {
    renderSkeleton(opponentCardEl);

    await new Promise(res => setTimeout(res, 800));

    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    const data = await res.json();

    await renderPokemonInfo(data, opponentCardEl);
    battleBtn.disabled = false;

  } catch {
    opponentCardEl.innerHTML = `<p>Pokémon no encontrado</p>`;
    battleBtn.disabled = true;
  }
}

// 🔥 DEBOUNCE
let debounceTimeout;

searchInput.addEventListener("input", (e) => {
  clearTimeout(debounceTimeout);

  debounceTimeout = setTimeout(() => {
    const value = e.target.value.trim();
    searchOpponent(value);
  }, 400);
});

// Botón batalla
battleBtn.addEventListener("click", () => {
  window.location.href = "../stage-2/index.html";
});

// Init
loadPlayerPokemon();