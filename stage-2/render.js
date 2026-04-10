import TRAINER from "../trainer.config.js";

// 1. Agregamos el diccionario fuera de la función para que esté disponible
const TYPE_EMOJIS = {
    fire: "🔥", water: "💧", grass: "🌿", electric: "⚡", 
    psychic: "🔮", ice: "❄️", fighting: "🥊", poison: "🧪", 
    ground: "🏜️", flying: "🕊️", bug: "🐞", rock: "🪨", 
    ghost: "👻", dragon: "🐲", dark: "🌑", steel: "⚙️", 
    fairy: "✨", normal: "🔘"
};

export function render(state) {
    const { player, opponent, playerHP, playerMaxHP, opponentHP, opponentMaxHP, playerPosition, incomingAttack, phase, log, attackOnCooldown, definitiveUsed } = state;

    if (!player || !opponent) return;

    // --- NUEVA LÓGICA DE NOMBRES CON EMOJI ---
    const pNameEl = document.getElementById("p-name");
    const oNameEl = document.getElementById("o-name");

    if (pNameEl) {
        // Buscamos el tipo: puede venir como objeto de API o como string directo
        const pType = player.types?.[0]?.type?.name || player.types?.[0];
        pNameEl.textContent = `${player.name.toUpperCase()} ${TYPE_EMOJIS[pType] || ""}`;
    }
    if (oNameEl) {
        const oType = opponent.types?.[0]?.type?.name || opponent.types?.[0];
        oNameEl.textContent = `${opponent.name.toUpperCase()} ${TYPE_EMOJIS[oType] || ""}`;
    }

    // --- CONTINUACIÓN DE TU CÓDIGO ORIGINAL (SIN CAMBIOS) ---
    document.getElementById("player-hp-fill").style.width = `${(playerHP / playerMaxHP) * 100}%`;
    document.getElementById("opponent-hp-fill").style.width = `${(opponentHP / opponentMaxHP) * 100}%`;
    
    // Agregamos el ❤️ aquí como pediste
    document.getElementById("player-hp-text").textContent = `❤️ ${Math.ceil(playerHP)} / ${playerMaxHP}`;
    document.getElementById("opponent-hp-text").textContent = `❤️ ${Math.ceil(opponentHP)} / ${opponentMaxHP}`;

    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell, index) => {
        const cellIndex = index + 1;
        cell.innerHTML = "";
        cell.classList.remove("warning");

        if (cellIndex === 2) {
            const img = document.createElement("img");
            img.id = "opponent-sprite";
            img.src = opponent.sprites.versions?.['generation-v']?.['black-white']?.animated?.front_default || opponent.sprites.front_default;
            img.className = "sprite";
            cell.appendChild(img);
        }

        if (cellIndex === playerPosition + 3) {
            const img = document.createElement("img");
            img.id = "player-sprite";
            img.src = player.sprites.versions?.['generation-v']?.['black-white']?.animated?.back_default || player.sprites.back_default || player.sprites.front_default;
            img.className = "sprite";
            cell.appendChild(img);
        }

        if (incomingAttack && cellIndex === incomingAttack + 3) {
            cell.classList.add("warning");
        }
    });

    const movesGrid = document.getElementById("normal-moves");
    if (movesGrid && movesGrid.innerHTML === "") {
        const movesToRender = player.movesInfo || []; 
        movesToRender.slice(0, 4).forEach(move => {
            const btn = document.createElement("button");
            btn.className = "move-btn";
            btn.dataset.moveName = move.name;
            const power = move.power || 60;
            btn.dataset.power = power;

            btn.innerHTML = `
                <span>⚔️ ${move.name.toUpperCase()}</span>
                <small style="display: block; font-size: 0.7rem; color: #f2d33b; margin-top: 4px;">Daño: ${power}</small>
            `;
            movesGrid.appendChild(btn);
        });
        document.getElementById("special-move-btn").textContent = `🌊 ${TRAINER.definitiveMoveName.toUpperCase()}`;
    }

    document.querySelectorAll(".move-btn").forEach(b => b.disabled = (attackOnCooldown || phase === 'ended'));
    document.getElementById("special-move-btn").disabled = (attackOnCooldown || definitiveUsed || phase === 'ended');

    const logBox = document.getElementById("battle-log");
    logBox.innerHTML = log.map(m => `<p>> ${m}</p>`).join("");
    logBox.scrollTop = logBox.scrollHeight;

    if (phase === 'ended' && !document.querySelector(".battle-over")) {
        const isWin = playerHP > 0;
        const div = document.createElement("div");
        div.className = "battle-over";
        div.innerHTML = `
            <div class="end-card">
                <h2>${isWin ? '¡VICTORIA!' : 'DERROTA'}</h2>
                <p>${isWin ? TRAINER.winMessage : TRAINER.loseMessage}</p>
                <button onclick="window.location.href='../index.html'">VOLVER AL INICIO</button>
            </div>`;
        document.body.appendChild(div);
    }
}