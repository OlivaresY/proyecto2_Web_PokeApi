import TRAINER from "../trainer.config.js";

// =========================
// ACTUALIZA DATOS DEL ENTRENADOR
// =========================
document.getElementById("trainer-name").textContent = TRAINER.name;
document.getElementById("trainer-town").textContent = TRAINER.hometown;
document.getElementById("trainer-phrase").textContent = TRAINER.catchphrase;

// =========================
// ELEMENTOS DEL DOM
// =========================
const playerCardEl = document.getElementById("player-card");
const opponentCardEl = document.getElementById("opponent-card");
const searchInput = document.getElementById("search");
const battleBtn = document.getElementById("battle-btn");

// =========================
// EMOJIS Y FUNCIONES AUXILIARES
// =========================
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