import TRAINER from "../trainer.config.js";

export function render(state) {
    const { player, opponent, playerHP, playerMaxHP, opponentHP, opponentMaxHP, playerPosition, incomingAttack, phase, log, attackOnCooldown, definitiveUsed } = state;

    if (!player || !opponent) return;

    // Vida
    document.getElementById("player-hp-fill").style.width = `${(playerHP / playerMaxHP) * 100}%`;
    document.getElementById("opponent-hp-fill").style.width = `${(opponentHP / opponentMaxHP) * 100}%`;
    document.getElementById("player-hp-text").textContent = `${Math.ceil(playerHP)} / ${playerMaxHP}`;
    document.getElementById("opponent-hp-text").textContent = `${Math.ceil(opponentHP)} / ${opponentMaxHP}`;

    // Grid y Movimiento
    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell, index) => {
        const cellIndex = index + 1;
        cell.innerHTML = "";
        cell.classList.remove("warning");

        if (cellIndex === 2) { // Oponente
            const img = document.createElement("img");
            img.src = opponent.sprites.versions?.['generation-v']?.['black-white']?.animated?.front_default || opponent.sprites.front_default;
            img.className = "sprite";
            cell.appendChild(img);
        }

        if (cellIndex === playerPosition + 3) { // Jugador
            const img = document.createElement("img");
            img.src = player.sprites.versions?.['generation-v']?.['black-white']?.animated?.back_default || player.sprites.back_default || player.sprites.front_default;
            img.className = "sprite";
            cell.appendChild(img);
        }

        if (incomingAttack && cellIndex === incomingAttack + 3) {
            cell.classList.add("warning");
        }
    });

    // Botones (Solo se crean la primera vez)
    const movesGrid = document.getElementById("normal-moves");
    if (movesGrid && movesGrid.innerHTML === "") {
        player.movesInfo.slice(0, 4).forEach(move => {
            const btn = document.createElement("button");
            btn.className = "move-btn";
            btn.dataset.moveName = move.name;
            btn.dataset.power = move.power || 60;
            btn.textContent = `⚔️ ${move.name.toUpperCase()}`;
            movesGrid.appendChild(btn);
        });
        document.getElementById("special-move-btn").textContent = `🌟 ${TRAINER.definitiveMoveName.toUpperCase()}`;
    }

    // Cooldowns y Bloqueos
    document.querySelectorAll(".move-btn").forEach(b => b.disabled = (attackOnCooldown || phase === 'ended'));
    const specBtn = document.getElementById("special-move-btn");
    specBtn.disabled = (attackOnCooldown || definitiveUsed || phase === 'ended');

    // Log
    const logBox = document.getElementById("battle-log");
    logBox.innerHTML = log.map(m => `<p>> ${m}</p>`).join("");
    logBox.scrollTop = logBox.scrollHeight;

    // Fin de juego
    if (phase === 'ended' && !document.querySelector(".battle-over")) {
        const isWin = playerHP > 0;
        const div = document.createElement("div");
        div.className = "battle-over";
        div.innerHTML = `<div class="end-card"><h2>${isWin ? '¡VICTORIA!' : 'DERROTA'}</h2><p>${isWin ? TRAINER.winMessage : TRAINER.loseMessage}</p><button onclick="location.reload()">REINTENTAR</button></div>`;
        document.body.appendChild(div);
    }
}