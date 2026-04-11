import TRAINER from "../trainer.config.js";

const TYPE_EMOJIS = {
    fire: "🔥", water: "💧", grass: "🌿", electric: "⚡", 
    psychic: "🔮", ice: "❄️", fighting: "🥊", poison: "🧪", 
    ground: "🏜️", flying: "🕊️", bug: "🐞", rock: "🪨", 
    ghost: "👻", dragon: "🐲", dark: "🌑", steel: "⚙️", 
    fairy: "✨", normal: "🔘"
};

// IMPORTANTE: Estas variables van FUERA para recordar la vida anterior entre renders
let prevPlayerHP = null;
let prevOpponentHP = null;

export function render(state) {
    const { player, opponent, playerHP, playerMaxHP, opponentHP, opponentMaxHP, playerPosition, incomingAttack, phase, log, attackOnCooldown, definitiveUsed } = state;

    if (!player || !opponent) return;

    // Inicializamos si es la primera vez
    if (prevPlayerHP === null) prevPlayerHP = playerHP;
    if (prevOpponentHP === null) prevOpponentHP = opponentHP;

    // --- 1. ACTUALIZACIÓN DE NOMBRES ---
    const pNameEl = document.getElementById("p-name");
    const oNameEl = document.getElementById("o-name");
    if (pNameEl) pNameEl.textContent = `${player.name.toUpperCase()} ${TYPE_EMOJIS[player.types?.[0]?.type?.name || player.types?.[0]] || ""}`;
    if (oNameEl) oNameEl.textContent = `${opponent.name.toUpperCase()} ${TYPE_EMOJIS[opponent.types?.[0]?.type?.name || opponent.types?.[0]] || ""}`;

    // --- 2. LÓGICA DE BARRAS (VERDE Y ROJA) ---
    
    const updateBarVisuals = (current, max, prev, fillId, damageId) => {
        const fillEl = document.getElementById(fillId);
        const damageEl = document.getElementById(damageId);
        if (!fillEl || !damageEl) return;

        const currentPct = (current / max) * 100;
        
        // La barra verde BAJA SIEMPRE inmediatamente
        fillEl.style.width = `${currentPct}%`;

        // La roja solo baja con retraso si recibimos daño
        if (current < prev) {
            setTimeout(() => {
                damageEl.style.width = `${currentPct}%`;
            }, 400); // 400ms de espera para que se vea el rastro rojo
        } else {
            // Si nos curamos o empezamos, se igualan
            damageEl.style.width = `${currentPct}%`;
        }
    };

    updateBarVisuals(playerHP, playerMaxHP, prevPlayerHP, "player-hp-fill", "player-damage-fill");
    updateBarVisuals(opponentHP, opponentMaxHP, prevOpponentHP, "opponent-hp-fill", "opponent-damage-fill");

    // Guardamos la vida actual para comparar en el siguiente renderizado
    prevPlayerHP = playerHP;
    prevOpponentHP = opponentHP;

    // --- 3. TEXTOS Y LOGS ---
    document.getElementById("player-hp-text").textContent = `❤️ ${Math.ceil(playerHP)} / ${playerMaxHP}`;
    document.getElementById("opponent-hp-text").textContent = `❤️ ${Math.ceil(opponentHP)} / ${opponentMaxHP}`;
    
    const logBox = document.getElementById("battle-log");
    logBox.innerHTML = log.map(m => `<p>> ${m}</p>`).join("");
    logBox.scrollTop = logBox.scrollHeight;

    // --- 4. GRID Y SPRITES ---
    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell, index) => {
        const cellIndex = index + 1;
        const oldSprite = cell.querySelector(".sprite");
        if (oldSprite) oldSprite.remove();
        cell.classList.remove("warning");

        // Oponente (Fila superior, celda 2)
        if (cellIndex === 2) {
    let img = cell.querySelector("#opponent-sprite");
    if (!img) {
        img = document.createElement("img");
        img.id = "opponent-sprite";
        img.className = "sprite";
        cell.appendChild(img);
    }
    img.src = opponent.sprites.versions?.['generation-v']?.['black-white']?.animated?.front_default 
        || opponent.sprites.front_default;
}

        // Jugador (Fila inferior, celdas 4, 5, 6)
        if (cellIndex === playerPosition + 3) {
    const img = document.createElement("img");
    img.id = "player-sprite"; // 🔥 IMPORTANTE para efectos
    img.className = "sprite";
    img.src = player.sprites.versions?.['generation-v']?.['black-white']?.animated?.back_default 
        || player.sprites.back_default 
        || player.sprites.front_default;

    cell.appendChild(img);
}

        if (incomingAttack && cellIndex === incomingAttack + 3) {
            cell.classList.add("warning");
        }
    });

    // --- 5. CONTROLES ---
    const movesGrid = document.getElementById("normal-moves");
    if (movesGrid && movesGrid.innerHTML === "") {
        player.movesInfo?.slice(0, 4).forEach(move => {
            const btn = document.createElement("button");
            btn.className = "move-btn";
            btn.dataset.moveName = move.name;
            btn.innerHTML = `<span class="move-name">⚔️ ${move.name.toUpperCase()}</span><small class="move-damage">Daño: ${move.power || 60}</small>`;
            btn.dataset.power = move.power || 60;
            movesGrid.appendChild(btn);
        });
        document.getElementById("special-move-btn").textContent = `🌊 ${TRAINER.definitiveMoveName.toUpperCase()}`;
    }

    document.querySelectorAll(".move-btn").forEach(b => b.disabled = (attackOnCooldown || phase === 'ended'));
    document.getElementById("special-move-btn").disabled = (attackOnCooldown || definitiveUsed || phase === 'ended');

    // Pantalla final
    if (phase === 'ended' && !document.querySelector(".battle-over")) {
        const isWin = playerHP > 0;
        const div = document.createElement("div");
        div.className = "battle-over";
        div.innerHTML = `
            <div class="end-card">
                <h2>${isWin ? '¡VICTORIA!' : 'DERROTA'}</h2>
                <p>${isWin ? TRAINER.winMessage : TRAINER.loseMessage}</p>
                <a href="../index.html" class="btn-volver">VOLVER AL INICIO</a>
            </div>`;
        document.body.appendChild(div);
    }
}