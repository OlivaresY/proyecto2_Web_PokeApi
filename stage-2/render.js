import TRAINER from "../trainer.config.js";

const TYPE_INFO = {
    fire: { color: '#ff9c54', emoji: '🔥' }, 
    water: { color: '#4d90d5', emoji: '💧' },
    grass: { color: '#63bb5b', emoji: '🌿' }, 
    electric: { color: '#f3d23b', emoji: '⚡' },
    ice: { color: '#74ced9', emoji: '❄️' }, 
    fighting: { color: '#ce4069', emoji: '🥊' },
    poison: { color: '#ab6ac8', emoji: '🧪' }, 
    ground: { color: '#d97746', emoji: '🏜️' },
    flying: { color: '#8fa8dd', emoji: '🕊️' }, 
    psychic: { color: '#f97176', emoji: '🔮' },
    bug: { color: '#90c12c', emoji: '🐞' }, 
    rock: { color: '#c7b78b', emoji: '🪨' },
    ghost: { color: '#5269ac', emoji: '👻' }, 
    dragon: { color: '#0a6dc4', emoji: '🐲' },
    dark: { color: '#5a5366', emoji: '🌑' }, 
    steel: { color: '#5a8ea1', emoji: '⚙️' },
    fairy: { color: '#ec8fe6', emoji: '✨' }, 
    normal: { color: '#9099a1', emoji: '🔘' }
};

// 🔥 Obtener TODOS los tipos (soporta cualquier formato)
const getTypes = (pokemon) => {
    if (!pokemon?.types) return [];

    return pokemon.types.map(t => {
        if (t.type?.name) return t.type.name.toLowerCase();
        if (t.name) return t.name.toLowerCase();
        if (typeof t === "string") return t.toLowerCase();
        return null;
    }).filter(Boolean);
};

// 🔥 Variables de control y vida previa
let prevPlayerHP = null;
let prevOpponentHP = null;
let endScreenCreated = false; // Bandera de control para evitar duplicados

export function render(state) {
    const {
        player,
        opponent,
        playerHP,
        playerMaxHP,
        opponentHP,
        opponentMaxHP,
        playerPosition,
        incomingAttack,
        phase,
        log,
        attackOnCooldown,
        definitiveUsed
    } = state;

    if (!player || !opponent) return;

    if (prevPlayerHP === null) prevPlayerHP = playerHP;
    if (prevOpponentHP === null) prevOpponentHP = opponentHP;

    // =========================
    // 🧠 1. NOMBRES + EMOJIS
    // =========================
    const pNameEl = document.getElementById("p-name");
    const oNameEl = document.getElementById("o-name");

    const playerTypes = getTypes(player);
    const opponentTypes = getTypes(opponent);

    const pEmojis = playerTypes.map(t => TYPE_INFO[t]?.emoji || '❓').join('');
    const oEmojis = opponentTypes.map(t => TYPE_INFO[t]?.emoji || '❓').join('');

    const pColor = TYPE_INFO[playerTypes[0]]?.color || '#4ade80';
    const oColor = TYPE_INFO[opponentTypes[0]]?.color || '#ef4444';

    if (pNameEl) {
        pNameEl.textContent = `${pEmojis} ${player.name.toUpperCase()}`;
        pNameEl.style.color = pColor;
        
        // Brillo neón dinámico en el borde del contenedor
        const pSection = pNameEl.closest('.hp-section');
        if (pSection) {
            pSection.style.borderLeftColor = pColor;
            pSection.style.boxShadow = `0 4px 10px rgba(0,0,0,0.3), inset 0 0 10px ${pColor}33`;
        }
    }

    if (oNameEl) {
        oNameEl.textContent = `${oEmojis} ${opponent.name.toUpperCase()}`;
        oNameEl.style.color = oColor;

        const oSection = oNameEl.closest('.hp-section');
        if (oSection) {
            oSection.style.borderLeftColor = oColor;
            oSection.style.boxShadow = `0 4px 10px rgba(0,0,0,0.3), inset 0 0 10px ${oColor}33`;
        }
    }

    // =========================
    // ❤️ 2. BARRAS DE VIDA
    // =========================
    const updateBarVisuals = (current, max, prev, fillId, damageId) => {
        const fillEl = document.getElementById(fillId);
        const damageEl = document.getElementById(damageId);
        if (!fillEl || !damageEl) return;

        const currentPct = (current / max) * 100;

        fillEl.style.width = `${currentPct}%`;

        if (current < prev) {
            setTimeout(() => {
                damageEl.style.width = `${currentPct}%`;
            }, 400);
        } else {
            damageEl.style.width = `${currentPct}%`;
        }
    };

    updateBarVisuals(playerHP, playerMaxHP, prevPlayerHP, "player-hp-fill", "player-damage-fill");
    updateBarVisuals(opponentHP, opponentMaxHP, prevOpponentHP, "opponent-hp-fill", "opponent-damage-fill");

    prevPlayerHP = playerHP;
    prevOpponentHP = opponentHP;

    // =========================
    // 📝 3. TEXTOS Y LOG
    // =========================
    document.getElementById("player-hp-text").textContent =
        `❤️ ${Math.ceil(playerHP)} / ${playerMaxHP}`;

    document.getElementById("opponent-hp-text").textContent =
        `❤️ ${Math.ceil(opponentHP)} / ${opponentMaxHP}`;

    const logBox = document.getElementById("battle-log");
    logBox.innerHTML = log.map(m => `<p>> ${m}</p>`).join("");
    logBox.scrollTop = logBox.scrollHeight;

    // =========================
    // 🎮 4. GRID Y SPRITES
    // =========================
    const cells = document.querySelectorAll(".cell");

    cells.forEach((cell, index) => {
        const cellIndex = index + 1;

        const oldSprite = cell.querySelector(".sprite");
        if (oldSprite) oldSprite.remove();

        cell.classList.remove("warning");

        // Oponente
        if (cellIndex === 2) {
            let img = cell.querySelector("#opponent-sprite");

            if (!img) {
                img = document.createElement("img");
                img.id = "opponent-sprite";
                img.className = "sprite";
                cell.appendChild(img);
            }

            img.src =
                opponent.sprites.versions?.['generation-v']?.['black-white']?.animated?.front_default ||
                opponent.sprites.front_default;
        }

        // Jugador
        if (cellIndex === playerPosition + 3) {
            const img = document.createElement("img");
            img.id = "player-sprite";
            img.className = "sprite";

            img.src =
                player.sprites.versions?.['generation-v']?.['black-white']?.animated?.back_default ||
                player.sprites.back_default ||
                player.sprites.front_default;

            cell.appendChild(img);
        }

        // Ataque entrante
        if (incomingAttack && cellIndex === incomingAttack + 3) {
            cell.classList.add("warning");
        }
    });

    // =========================
    // ⚔️ 5. MOVIMIENTOS
    // =========================
    const movesGrid = document.getElementById("normal-moves");

    if (movesGrid && movesGrid.innerHTML === "") {
        player.movesInfo?.slice(0, 4).forEach(move => {
            const btn = document.createElement("button");
            btn.className = "move-btn";
            btn.dataset.moveName = move.name;

            btn.innerHTML = `
                <span class="move-name">⚔️ ${move.name.toUpperCase()}</span>
                <small class="move-damage">Daño: ${move.power || 60}</small>
            `;

            btn.dataset.power = move.power || 60;

            movesGrid.appendChild(btn);
        });

        document.getElementById("special-move-btn").textContent =
            `🌊 ${TRAINER.definitiveMoveName.toUpperCase()}`;
    }

    document.querySelectorAll(".move-btn")
        .forEach(b => b.disabled = (attackOnCooldown || phase === 'ended'));

    document.getElementById("special-move-btn").disabled =
        (attackOnCooldown || definitiveUsed || phase === 'ended');

    // =========================
    // 🏁 6. FINAL
    // =========================
    if (phase === 'ended' && !endScreenCreated) {
        if (!document.querySelector(".battle-over")) {
            endScreenCreated = true; 
            const isWin = playerHP > 0;

            const div = document.createElement("div");
            div.className = "battle-over";

            div.innerHTML = `
                <div class="end-card">
                    <h2>${isWin ? '¡VICTORIA!' : 'DERROTA'}</h2>
                    <p>${isWin ? TRAINER.winMessage : TRAINER.loseMessage}</p>
                    <a href="../index.html" class="btn-volver">VOLVER AL INICIO</a>
                </div>
            `;

            document.body.appendChild(div);
        }
    }
}