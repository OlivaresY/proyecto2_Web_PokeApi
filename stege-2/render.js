import TRAINER from "../trainer.config.js";

/**
 * Función principal que sincroniza el DOM con el objeto state.
 * No lee datos del DOM, solo escribe en él basándose en el estado.
 */
export function render(state) {
    const { 
        player, opponent, 
        playerHP, playerMaxHP, 
        opponentHP, opponentMaxHP, 
        playerPosition, 
        incomingAttack, 
        phase, 
        log,
        attackOnCooldown,
        definitiveUsed
    } = state;

    if (!player || !opponent) return;

    // 1. ACTUALIZAR BARRAS DE VIDA Y TEXTO
    const playerFill = document.getElementById("player-hp-fill");
    const opponentFill = document.getElementById("opponent-hp-fill");
    const playerText = document.getElementById("player-hp-text");
    const opponentText = document.getElementById("opponent-hp-text");

    const pPct = Math.max(0, (playerHP / playerMaxHP) * 100);
    const oPct = Math.max(0, (opponentHP / opponentMaxHP) * 100);

    playerFill.style.width = `${pPct}%`;
    opponentFill.style.width = `${oPct}%`;
    playerText.textContent = `${Math.ceil(playerHP)} / ${playerMaxHP}`;
    opponentText.textContent = `${Math.ceil(opponentHP)} / ${opponentMaxHP}`;

    // Cambiar color de la barra según la salud (Verde -> Amarillo -> Rojo)
    playerFill.style.background = pPct < 20 ? "#ef4444" : pPct < 50 ? "#facc15" : "#4ade80";
    opponentFill.style.background = oPct < 20 ? "#ef4444" : oPct < 50 ? "#facc15" : "#4ade80";

    // 2. RENDERIZAR EL GRID (Celdas 1-3 oponente, 4-6 jugador)
    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell, index) => {
        const cellIndex = index + 1;
        cell.innerHTML = ""; // Limpiar celda
        cell.classList.remove("warning");

        // Oponente: Siempre en la celda 2 (centro de la fila superior)
        if (cellIndex === 2) {
            const img = document.createElement("img");
            // Intentamos usar sprite animado, si no, el normal
            img.src = opponent.sprites.versions['generation-v']['black-white'].animated.front_default || opponent.sprites.front_default;
            img.className = "sprite";
            cell.appendChild(img);
        }

        // Jugador: Se mueve entre las celdas 4, 5 y 6 (fila inferior)
        // playerPosition es 1, 2 o 3, por lo que sumamos 3
        if (cellIndex === playerPosition + 3) {
            const img = document.createElement("img");
            img.src = player.sprites.versions['generation-v']['black-white'].animated.back_default || player.sprites.back_default;
            img.className = "sprite";
            cell.appendChild(img);
        }

        // Feedback visual de ataque enemigo (Advertencia)
        if (incomingAttack && cellIndex === incomingAttack + 3) {
            cell.classList.add("warning");
        }
    });

    // 3. ACTUALIZAR LOG DE BATALLA
    const logContainer = document.getElementById("battle-log");
    logContainer.innerHTML = log.map(msg => `<p>> ${msg}</p>`).join("");
    logContainer.scrollTop = logContainer.scrollHeight; // Auto-scroll al final

    // 4. ACTUALIZAR ESTADO DE BOTONES
    const normalMovesContainer = document.getElementById("normal-moves");
    
    // Solo dibujamos los botones una vez si el contenedor está vacío
    if (normalMovesContainer.innerHTML === "") {
        player.movesInfo.slice(0, 4).forEach(move => {
            const btn = document.createElement("button");
            btn.className = "move-btn";
            btn.textContent = move.name.toUpperCase();
            // El evento de click lo manejaremos en main.js vía delegación o dispatch
            btn.dataset.moveName = move.name;
            btn.dataset.power = move.power || 60;
            normalMovesContainer.appendChild(btn);
        });
        
        const specBtn = document.getElementById("special-move-btn");
        specBtn.textContent = TRAINER.definitiveMoveName.toUpperCase();
    }

    // Bloqueo de botones por cooldown, fin de juego o uso de definitiva
    const allBtns = document.querySelectorAll(".move-btn");
    allBtns.forEach(b => b.disabled = (attackOnCooldown || phase === 'ended'));
    
    const specialBtn = document.getElementById("special-move-btn");
    specialBtn.disabled = (attackOnCooldown || definitiveUsed || phase === 'ended');

    // 5. MOSTRAR MENSAJE DE FIN (Si aplica)
    if (phase === 'ended') {
        const isWin = playerHP > 0;
        const msg = isWin ? TRAINER.winMessage : TRAINER.loseMessage;
        if (!document.querySelector(".battle-over")) {
            const endMsg = document.createElement("div");
            endMsg.className = "battle-over";
            endMsg.innerHTML = `<h2>${isWin ? '¡VICTORIA!' : 'DERROTA'}</h2><p>${msg}</p><button onclick="location.reload()">REINTENTAR</button>`;
            document.querySelector(".battle-container").appendChild(endMsg);
        }
    }
}