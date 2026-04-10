import TRAINER from "../trainer.config.js";
import { state, formulas, wait } from "./battle.js";
import { render } from "./render.js";

async function init() {
    const data = JSON.parse(localStorage.getItem("battleData"));
    if (!data) { 
        window.location.href = "../index.html"; 
        return; 
    }

    state.player = data.player;
    state.opponent = data.opponent;
    state.playerMaxHP = Math.floor(state.player.stats.find(s => s.stat.name === "hp").base_stat * 2.5);
    state.opponentMaxHP = Math.floor(state.opponent.stats.find(s => s.stat.name === "hp").base_stat * 2.5);
    state.playerHP = state.playerMaxHP;
    state.opponentHP = state.opponentMaxHP;

    document.getElementById("p-name").textContent = state.player.name;
    document.getElementById("o-name").textContent = state.opponent.name;

    document.addEventListener('keydown', handleKeyDown);
    document.getElementById("normal-moves").addEventListener('click', handlePlayerAttack);
    document.getElementById("special-move-btn").addEventListener('click', handleSpecialAttack);

    render(state);
    scheduleEnemyAttack();
}

function handleKeyDown(e) {
    if (state.phase !== 'fighting' || state.locked) return;
    if (e.key === "ArrowLeft" && state.playerPosition > 1) { state.playerPosition--; render(state); }
    if (e.key === "ArrowRight" && state.playerPosition < 3) { state.playerPosition++; render(state); }
}

function triggerDamageEffect(isPlayer) {
    // Usamos requestAnimationFrame para asegurar que el DOM esté listo
    requestAnimationFrame(() => {
        const id = isPlayer ? "player-sprite" : "opponent-sprite";
        const el = document.getElementById(id);
        
        //solo actuamos si el elemento existe
        if (el) {
            //parpadeo y movimiento al impacto
            el.classList.add("dmg-shake");
            
            const xMark = document.createElement("div");
            xMark.className = "damage-x";
            xMark.textContent = "✘";
            
            el.parentElement.appendChild(xMark);

            setTimeout(() => {
                if (el) el.classList.remove("dmg-shake");
                
                // Remueve la "X" del DOM
                if (xMark.parentNode) xMark.parentNode.removeChild(xMark);
            }, 500);
        }
    });
}

function handlePlayerAttack(e) {
    const btn = e.target.closest(".move-btn");
    if (!btn || state.phase !== 'fighting' || state.attackOnCooldown) return;
    
    const damage = formulas.playerAttack(parseInt(btn.dataset.power));
    state.opponentHP = Math.max(0, state.opponentHP - damage);
    state.log.push(`¡${state.player.name} usó ${btn.dataset.moveName.toUpperCase()}! Daño: ${damage}`);
    
    render(state); 
    triggerDamageEffect(false); 
    
    startCooldown(2500, btn);
    checkBattleEnd();
}

function startCooldown(duration, btn) {
    const start = performance.now();
    state.attackOnCooldown = true;
    render(state);

    function tick(now) {
        const elapsed = now - start;
        const pct = Math.min(elapsed / duration, 1);
        let bar = btn.querySelector(".cooldown-overlay") || document.createElement("div");
        
        if (!bar.classList.contains("cooldown-overlay")) { 
            bar.className = "cooldown-overlay"; 
            btn.appendChild(bar); 
        }

        bar.style.width = `${(1 - pct) * 100}%`;

        // CORRECCIÓN: Si la batalla termina, forzamos la limpieza del cooldown
        if (pct < 1 && state.phase === 'fighting') { 
            requestAnimationFrame(tick); 
        } else { 
            state.attackOnCooldown = false; 
            if (bar.parentNode) bar.remove(); 
            render(state); 
        }
    }
    requestAnimationFrame(tick);
}

function handleSpecialAttack() {
    if (state.phase !== 'fighting' || state.definitiveUsed) return;
    
    state.definitiveUsed = true;
    
    // 1. Primero aplicamos el daño visualmente pero NO terminamos el juego aún
    state.opponentHP = 0; 
    render(state); // Esto actualiza la barra de vida a 0
    triggerDamageEffect(false); // Esto lanza la "X"
    
    state.log.push(`¡${TRAINER.definitiveMoveName.toUpperCase()}! ${TRAINER.definitiveMoveFlavor}`);

    // 2. Esperamos 600ms (lo que dura la animación de la X) antes de mostrar el cartel de victoria
    setTimeout(() => {
        checkBattleEnd();
    }, 1000);
}

function scheduleEnemyAttack() {
    if (state.phase !== 'fighting') return;
    const delay = (Math.random() * 1.2 + 0.8) * 1000;
    
    const t = setTimeout(async () => {
        // CORRECCIÓN: Si la batalla terminó mientras esperábamos el delay, abortamos
        if (state.phase !== 'fighting') return;

        const target = Math.floor(Math.random() * 3) + 1;
        state.incomingAttack = target;
        render(state);
        await wait(400);
        
        if (state.phase !== 'fighting') return; // Re-verificar tras el wait

        state.locked = true;
        render(state);

        if (state.playerPosition === target) {
            const enemyStatAtk = state.opponent.stats.find(s => s.stat.name === "attack").base_stat;
            const dmg = formulas.enemyAttack(enemyStatAtk);
            state.playerHP = Math.max(0, state.playerHP - dmg); 
            render(state);
            triggerDamageEffect(true);
            state.log.push(`¡Golpe enemigo! -${dmg} HP`);
        } else { 
            state.log.push(`¡Ataque esquivado!`);
        }
        
        state.incomingAttack = null; 
        state.locked = false;
        checkBattleEnd(); 
        render(state);
        
        if (state.phase === 'fighting') scheduleEnemyAttack();
    }, delay);
    state.timers.push(t);
}

function checkBattleEnd() {
    if (state.playerHP <= 0 || state.opponentHP <= 0) {
        state.phase = 'ended';
        state.timers.forEach(clearTimeout);
        document.removeEventListener('keydown', handleKeyDown);
        render(state);
    }
}

document.addEventListener('DOMContentLoaded', init);