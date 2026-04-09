import TRAINER from "../trainer.config.js";
import { getValidMoves, fetchMovesDetails } from "./api.js";

const typeEmoji = (type) => ({
  electric: "⚡", water: "💧", fire: "🔥", grass: "🌿", ice: "❄️",
  fighting: "🥊", poison: "☠️", ground: "🌍", flying: "🕊️", psychic: "🔮",
  bug: "🐛", rock: "🪨", ghost: "👻", dragon: "🐉", dark: "🌑",
  steel: "⚙️", fairy: "✨", normal: "⬜"
}[type] || "❓");

const typeColor = (type) => ({
  electric: "#f9e045", water: "#3da4f7", fire: "#f75c03", grass: "#63c74d",
  ice: "#9de0ff", fighting: "#d56723", poison: "#b97fc9", ground: "#e0c068",
  flying: "#a890f0", psychic: "#f85888", bug: "#a8b820", rock: "#b8a038",
  ghost: "#705898", dragon: "#7038f8", dark: "#705848", steel: "#b8b8d0",
  fairy: "#f4bdc9", normal: "#a8a878"
}[type] || "#777");

export function renderSkeleton(container) {
  container.innerHTML = `
    <div class="skeleton skeleton-img"></div>
    <div class="skeleton skeleton-text"></div>
    <div class="skeleton skeleton-text"></div>
  `;
}

export async function renderPokemon(data, container) {
  const type = data.types[0].type.name;
  const hp = data.stats.find(s => s.stat.name === "hp").base_stat;
  const attack = data.stats.find(s => s.stat.name === "attack").base_stat;
  const defense = data.stats.find(s => s.stat.name === "defense").base_stat;
  const speed = data.stats.find(s => s.stat.name === "speed").base_stat;

  container.classList.add("dynamic-bg");
  container.style.backgroundColor = typeColor(type);

  container.innerHTML = `
    <img src="${data.sprites.front_default}" class="pokemon-sprite">
    <p><strong>${data.name.toUpperCase()} ${typeEmoji(type)}</strong></p>
    <div class="pokemon-stats">
      <span>❤️ ${hp}</span>
      <span>⚔️ ${attack}</span>
      <span>🛡️ ${defense}</span>
      <span>⚡ ${speed}</span>
    </div>
    <button class="def-move-btn">
      ${container.id === "player-card" ? TRAINER.definitiveMoveName : "DESCONOCIDO"}
    </button>
    <div class="moves-buttons"></div>
  `;

  const movesContainer = container.querySelector(".moves-buttons");
  const validMoves = getValidMoves(data);
  const results = await fetchMovesDetails(validMoves);

  for (let i = 0; i < 4; i++) {
    const btn = document.createElement("button");
    btn.className = "move-btn";
    if (results[i]?.status === "fulfilled") {
      btn.textContent = results[i].value.name;
    } else if (validMoves[i]) {
      btn.textContent = validMoves[i].move.name;
    } else {
      btn.textContent = "-";
    }
    movesContainer.appendChild(btn);
  }
}