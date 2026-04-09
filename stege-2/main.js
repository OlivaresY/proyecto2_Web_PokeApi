import TRAINER from "../trainer.config.js";
import { state, formulas, wait } from "./battle.js";
import { render } from "./render.js";

// --- 1. INICIALIZACIÓN ---
async function init() {
    const data = JSON.parse(localStorage.getItem("battleData"));

    if (!data) {
        window.location.href = "../index.html";
        return;
    }

    // Cargar datos y calcular vida (Requisito: base_stat * 2.5)
    state.player = data.player;
    state.opponent = data.opponent;
    state.playerMaxHP = Math.floor(state.player.stats.find(s => s.stat.name === "hp").base_stat * 2.5);
    state.opponentMaxHP = Math.floor(state.opponent.stats.find(s => s.stat.name === "hp").base_stat * 2.5);
    state.playerHP = state.playerMaxHP;
    state.opponentHP = state.opponentMaxHP;

    // Configurar UI inicial
    document.getElementById("p-name").textContent = state.player.name;
    document.getElementById("o-name").textContent = state.opponent.name;
    state.log.push(`¡Un ${state.opponent.name} salvaje apareció!`);

    // Eventos de control (Teclado y Clics)
    document.addEventListener('keydown', handleKeyDown);
    document.getElementById("normal-moves").addEventListener('click', handlePlayerAttack);
    document.getElementById("special-move-btn").addEventListener('click', handleSpecialAttack);

    render(state);
    scheduleEnemyAttack();
}

// --- 2. MOVIMIENTO (Flechas) ---
function handleKeyDown(e) {
    if (state.phase !== 'fighting' || state.locked) return;

    if (e.key === "ArrowLeft" && state.playerPosition > 1) {
        state.playerPosition--;
        render(state);
    } else if (e.key === "ArrowRight" && state.playerPosition < 3) {
        state.playerPosition++;
        render(state);
    }
}

// --- 3. ATAQUE DEL JUGADOR (Con Cooldown) ---
function startCooldown(durationMs, btnElement) {
    const start = performance.now();
    state.attackOnCooldown = true;
    render(state);

    function tick(now) {
        const elapsed = now - start;
        const pct = Math.min(elapsed / durationMs, 1);
        
        // Crear o actualizar la barra de carga en el botón
        let bar = btnElement.querySelector(".cooldown-overlay");
        if (!bar) {
            bar = document.createElement("div");
            bar.className = "cooldown-overlay";
            btnElement.appendChild(bar);
        }
        bar.style.width = `${(1 - pct) * 100}%`;

        if (pct < 1 && state.phase === 'fighting') {
            requestAnimationFrame(tick);
        } else {
            state.attackOnCooldown = false;
            if (bar.parentNode) btnElement.removeChild(bar);
            render(state);
        }
    }
    requestAnimationFrame(tick);
}

function handlePlayerAttack(e) {
    const btn = e.target.closest(".move-btn");
    if (!btn || state.phase !== 'fighting' || state.attackOnCooldown) return;

    const moveName = btn.dataset.moveName;
    const power = parseInt(btn.dataset.power);
    
    const damage = formulas.playerAttack(power);
    state.opponentHP = Math.max(0, state.opponentHP - damage);
    
    state.log.push(`¡${state.player.name} usó ${moveName.toUpperCase()}!`);
    state.log.push(`Daño causado: ${damage}.`);

    startCooldown(2500, btn); // 2.5 segundos de enfriamiento
    checkBattleEnd();
    render(state);
}

function handleSpecialAttack() {
    if (state.phase !== 'fighting' || state.definitiveUsed || state.attackOnCooldown) return;

    state.definitiveUsed = true;
    state.opponentHP = 0; // KO Instantáneo (Requisito)
    
    state.log.push(`¡${TRAINER.definitiveMoveName.toUpperCase()}!`);
    state.log.push(`${TRAINER.definitiveMoveFlavor}`);
    
    checkBattleEnd();
    render(state);
}

// --- 4. IA ENEMIGA (Recursive setTimeout) ---
function scheduleEnemyAttack() {
    if (state.phase !== 'fighting') return;

    const delay = (Math.random() * (10 - 3) + 3) * 1000;
    const timeout = setTimeout(async () => {
        await resolveEnemyAttack();
        if (state.phase === 'fighting') scheduleEnemyAttack();
    }, delay);

    state.timers.push(timeout);
}

async function resolveEnemyAttack() {
    const targetCell = Math.floor(Math.random() * 3) + 1;
    state.incomingAttack = targetCell;
    render(state);

    await wait(600); // Ventana de advertencia
    state.locked = true; // Bloqueo de movimiento
    render(state);

    if (state.playerPosition === targetCell) {
        const attackStat = state.opponent.stats.find(s => s.stat.name === "attack").base_stat;
        const damage = formulas.enemyAttack(attackStat);
        state.playerHP = Math.max(0, state.playerHP - damage);
        state.log.push(`¡${state.opponent.name} te ha golpeado! (-${damage})`);
    } else {
        state.log.push(`¡Esquivaste el ataque del oponente!`);
    }

    state.incomingAttack = null;
    state.locked = false;
    checkBattleEnd();
    render(state);
}

// --- 5. FIN DE JUEGO ---
function checkBattleEnd() {
    if (state.playerHP <= 0 || state.opponentHP <= 0) {
        state.phase = 'ended';
        state.timers.forEach(t => clearTimeout(t));
        document.removeEventListener('keydown', handleKeyDown);
    }
}

document.addEventListener('DOMContentLoaded', init);