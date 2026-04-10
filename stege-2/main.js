import TRAINER from "../trainer.config.js";
import { state, formulas, wait } from "./battle.js";
import { render } from "./render.js";

async function init() {
    const data = JSON.parse(localStorage.getItem("battleData"));
    if (!data) { window.location.href = "../index.html"; return; }

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
    // requestAnimationFrame asegura que el render() previo ya terminó de dibujar
    requestAnimationFrame(() => {
        const id = isPlayer ? "player-sprite" : "opponent-sprite";
        const el = document.getElementById(id);
        
        if (el) {
            el.classList.add("dmg-shake");
            
            const xMark = document.createElement("div");
            xMark.className = "damage-x";
            xMark.textContent = "✘";
            
            // Se añade a la celda (el contenedor del sprite)
            el.parentElement.appendChild(xMark);

            setTimeout(() => {
                if (el) el.classList.remove("dmg-shake");
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
        if (!bar.classList.contains("cooldown-overlay")) { bar.className = "cooldown-overlay"; btn.appendChild(bar); }
        bar.style.width = `${(1 - pct) * 100}%`;
        if (pct < 1 && state.phase === 'fighting') { requestAnimationFrame(tick); }
        else { state.attackOnCooldown = false; if (bar.parentNode) btn.removeChild(bar); render(state); }
    }
    requestAnimationFrame(tick);
}

function handleSpecialAttack() {
    if (state.phase !== 'fighting' || state.definitiveUsed) return;
    state.definitiveUsed = true;
    state.opponentHP = 0;
    render(state);
    triggerDamageEffect(false);
    state.log.push(`¡${TRAINER.definitiveMoveName.toUpperCase()}! ${TRAINER.definitiveMoveFlavor}`);
    checkBattleEnd();
}

function scheduleEnemyAttack() {
    if (state.phase !== 'fighting') return;
    const delay = (Math.random() * 5 + 2) * 1000;
    const t = setTimeout(async () => {
        const target = Math.floor(Math.random() * 3) + 1;
        state.incomingAttack = target;
        render(state);
        await wait(600);
        state.locked = true;
        render(state);
        if (state.playerPosition === target) {
            const dmg = formulas.enemyAttack(state.opponent.stats.find(s => s.stat.name === "attack").base_stat);
            state.playerHP = Math.max(0, state.playerHP - dmg);
            render(state);
            triggerDamageEffect(true);
            state.log.push(`¡Golpe enemigo! -${dmg} HP`);
        } else { state.log.push(`¡Esquivado!`); }
        state.incomingAttack = null; state.locked = false;
        checkBattleEnd(); render(state);
        if (state.phase === 'fighting') scheduleEnemyAttack();
    }, delay);
    state.timers.push(t);
}

function checkBattleEnd() {
    if (state.playerHP <= 0 || state.opponentHP <= 0) {
        state.phase = 'ended';
        state.timers.forEach(clearTimeout);
        render(state);
    }
}

document.addEventListener('DOMContentLoaded', init);