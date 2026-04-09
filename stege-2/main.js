import TRAINER from "../trainer.config.js";
import { state, formulas, wait } from "./battle.js";
import { render } from "./render.js";

// --- INICIALIZACIÓN ---
async function init() {
    const data = JSON.parse(localStorage.getItem("battleData"));

    // Si no hay datos, volvemos al inicio
    if (!data) {
        window.location.href = "../index.html";
        return;
    }

    // 1. Cargar Pokémon en el estado
    state.player = data.player;
    state.opponent = data.opponent;

    // 2. Calcular HP (Base HP * 2.5) según requisito 05
    state.playerMaxHP = Math.floor(state.player.stats.find(s => s.stat.name === "hp").base_stat * 2.5);
    state.opponentMaxHP = Math.floor(state.opponent.stats.find(s => s.stat.name === "hp").base_stat * 2.5);
    
    state.playerHP = state.playerMaxHP;
    state.opponentHP = state.opponentMaxHP;

    // 3. Configurar textos iniciales en el DOM
    document.getElementById("p-name").textContent = state.player.name;
    document.getElementById("o-name").textContent = state.opponent.name;
    state.log.push(`¡Un ${state.opponent.name} salvaje apareció!`);
    state.log.push(`${TRAINER.name} envía a ${state.player.name}!`);

    // 4. Registrar Eventos de teclado (Se registra una sola vez)
    document.addEventListener('keydown', handleKeyDown);

    // 5. Primer renderizado y comienzo del bucle enemigo
    render(state);
    scheduleEnemyAttack();
}

// --- MOVIMIENTO ---
function handleKeyDown(e) {
    if (state.phase !== 'fighting') return;
    if (state.locked) return; // Bloqueo durante el impacto (Requisito 05)

    if (e.key === "ArrowLeft" && state.playerPosition > 1) {
        state.playerPosition--;
        render(state);
    } else if (e.key === "ArrowRight" && state.playerPosition < 3) {
        state.playerPosition++;
        render(state);
    }
}

// --- LÓGICA DEL ENEMIGO (Bucle Real-Time) ---
function scheduleEnemyAttack() {
    if (state.phase !== 'fighting') return;

    // Intervalo aleatorio entre 3 y 10 segundos
    const delay = (Math.random() * (10 - 3) + 3) * 1000;

    const timeout = setTimeout(async () => {
        await resolveEnemyAttack();
        if (state.phase === 'fighting') scheduleEnemyAttack(); // Bucle recursivo
    }, delay);

    state.timers.push(timeout);
}

async function resolveEnemyAttack() {
    // 1. Telegrafiar ataque (Elegir celda 1, 2 o 3)
    const targetCell = Math.floor(Math.random() * 3) + 1;
    state.incomingAttack = targetCell;
    state.log.push(`${state.opponent.name} está cargando un ataque en la zona ${targetCell}...`);
    render(state);

    // 2. Ventana de aviso (600ms para reaccionar)
    await wait(600);

    // 3. LOCK: El jugador ya no puede moverse
    state.locked = true;
    render(state);

    // 4. Resolución del daño
    if (state.playerPosition === targetCell) {
        const oppAttack = state.opponent.stats.find(s => s.stat.name === "attack").base_stat;
        const damage = formulas.enemyAttack(oppAttack);
        state.playerHP = Math.max(0, state.playerHP - damage);
        state.log.push(`¡GOLPE DIRECTO! Recibes ${damage} de daño.`);
    } else {
        state.log.push(`¡Esquivaste el ataque con éxito!`);
    }

    // 5. Reset de fase de ataque
    state.incomingAttack = null;
    state.locked = false;
    
    checkBattleEnd();
    render(state);
}

function checkBattleEnd() {
    if (state.playerHP <= 0) {
        state.phase = 'ended';
        state.log.push(TRAINER.loseMessage);
    } else if (state.opponentHP <= 0) {
        state.phase = 'ended';
        state.log.push(TRAINER.winMessage);
    }

    if (state.phase === 'ended') {
        // Limpiar todos los timers para evitar "orphaned timeouts"
        state.timers.forEach(t => clearTimeout(t));
        document.removeEventListener('keydown', handleKeyDown);
    }
}

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);