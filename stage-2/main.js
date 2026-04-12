import TRAINER from "../trainer.config.js";
import { state, formulas, wait } from "./battle.js";
import { render } from "./render.js";

//Función que inicia todo al cargar la página
async function init() {
    //Recupera los datos guardados en la pantalla de selección
    const data = JSON.parse(localStorage.getItem("battleData"));
    if (!data) { 
        window.location.href = "../index.html"; 
        return; 
    }

    // Configura el estado inicial con los datos de la API
    state.player = data.player;
    state.opponent = data.opponent;
    // Calcula vida máxima (stat base * 2.5 para que la pelea dure más)
    state.playerMaxHP = Math.floor(state.player.stats.find(s => s.stat.name === "hp").base_stat * 2.5);
    state.opponentMaxHP = Math.floor(state.opponent.stats.find(s => s.stat.name === "hp").base_stat * 2.5);
    state.playerHP = state.playerMaxHP;
    state.opponentHP = state.opponentMaxHP;

    // Escribe los nombres en la pantalla
    document.getElementById("p-name").textContent = state.player.name;
    document.getElementById("o-name").textContent = state.opponent.name;

    // Escucha eventos: teclado, clics en ataques y ataque especial
    document.addEventListener('keydown', handleKeyDown);
    document.getElementById("normal-moves").addEventListener('click', handlePlayerAttack);
    document.getElementById("special-move-btn").addEventListener('click', handleSpecialAttack);

    
    render(state); //Dibuja la batalla por primera vez
    scheduleEnemyAttack(); //Inicia el ciclo de ataques del oponente
}

//Maneja el movimiento con las flechas del teclado
function handleKeyDown(e) {
    if (state.phase !== 'fighting' || state.locked) return;
    if (e.key === "ArrowLeft" && state.playerPosition > 1) { state.playerPosition--; render(state); }
    if (e.key === "ArrowRight" && state.playerPosition < 3) { state.playerPosition++; render(state); }
}

//Crea el efecto visual de parpadeo y la "X" al recibir daño
function triggerDamageEffect(isPlayer) {
    // Usamos requestAnimationFrame para asegurar que el DOM esté listo
    requestAnimationFrame(() => {
        const id = isPlayer ? "player-sprite" : "opponent-sprite";
        const el = document.getElementById(id);
        
        //solo actuamos si el elemento existe
        if (el) {
            el.classList.add("dmg-shake"); //parpadeo y movimiento al impacto
            
            const xMark = document.createElement("div"); //Crea el elemento de la X
            xMark.className = "damage-x";
            xMark.textContent = "✘";
            
            el.parentElement.appendChild(xMark); //Muestra la X sobre el Pokémon

            setTimeout(() => {
                if (el) el.classList.remove("dmg-shake"); //Quita la sacudida
                if (xMark.parentNode) xMark.parentNode.removeChild(xMark); //Borra la X
            }, 500);
        }
    });
}

//Maneja los clics en los botones de ataque normal
function handlePlayerAttack(e) {
    const btn = e.target.closest(".move-btn"); //Detecta qué botón se pulsó
    if (!btn || state.phase !== 'fighting' || state.attackOnCooldown) return;
    
    const damage = formulas.playerAttack(parseInt(btn.dataset.power)); //Calcula daño
    state.opponentHP = Math.max(0, state.opponentHP - damage); //Resta vida al oponente
    state.log.push(`¡${state.player.name} usó ${btn.dataset.moveName.toUpperCase()}! Daño: ${damage}`);
    
    render(state); 
    triggerDamageEffect(false);  //Efecto visual en el enemigo
    
    startCooldown(2500, btn); //Inicia espera de 2.5 segundos para volver a atacar
    checkBattleEnd(); //Revisa si el oponente murió
}

//Controla la barra visual de recarga del botón
function startCooldown(duration, btn) {
    const start = performance.now();
    state.attackOnCooldown = true; //Bloquea ataques
    render(state);

    function tick(now) {
        const elapsed = now - start;
        const pct = Math.min(elapsed / duration, 1); //Calcula progreso (0 a 1)
        let bar = btn.querySelector(".cooldown-overlay") || document.createElement("div");
        
        if (!bar.classList.contains("cooldown-overlay")) { 
            bar.className = "cooldown-overlay"; 
            btn.appendChild(bar); 
        }

        bar.style.width = `${(1 - pct) * 100}%`; //Reduce el ancho de la barra de carga

        //Continúa la animación solo si seguimos peleando
        if (pct < 1 && state.phase === 'fighting') { 
            requestAnimationFrame(tick); 
        } else { 
            state.attackOnCooldown = false; //Desbloquea ataques
            if (bar.parentNode) bar.remove(); 
            render(state); 
        }
    }
    requestAnimationFrame(tick);
}

//Maneja el botón de "Definitiva" (Victoria instantánea)
function handleSpecialAttack() {
    if (state.phase !== 'fighting' || state.definitiveUsed) return;
    
    state.phase = 'ended'; //Detiene la lógica de pelea
    state.timers.forEach(clearTimeout); //Cancela ataques enemigos pendientes
    state.definitiveUsed = true; // Marca como usado
    
    //Daño visual
    state.opponentHP = 0;  //Mata al oponente
    state.incomingAttack = null; //Limpia cualquier celda roja de aviso antes del golpe final
    render(state); 
    triggerDamageEffect(false);
    
    state.log.push(`¡${TRAINER.definitiveMoveName.toUpperCase()}! ${TRAINER.definitiveMoveFlavor}`);

    //Esperamos a que la animación de la "X" termine antes de mostrar el cartel
    setTimeout(() => {
        checkBattleEnd(); //Muestra pantalla final después de 1 segundo
    }, 1000);
}

//Ciclo infinito de ataques del oponente
function scheduleEnemyAttack() {
    if (state.phase !== 'fighting') return;
    const delay = (Math.random() * 1.2 + 0.8) * 1000; //Tiempo aleatorio entre ataques
    
    const t = setTimeout(async () => {
        //CORRECCIÓN: Si la batalla terminó mientras esperábamos el delay, abortamos
        if (state.phase !== 'fighting') return;

        const target = Math.floor(Math.random() * 3) + 1; //Elige columna 1, 2 o 3
        state.incomingAttack = target; //Muestra la alerta roja
        render(state);
        await wait(400); //Tiempo de reacción para el jugador
        
        if (state.phase !== 'fighting') return; // Re-verificar tras el wait

        state.locked = true; //Bloquea movimiento durante el impacto
        render(state);

        //Si el jugador está en la misma columna que el ataque, recibe daño
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
        
        state.incomingAttack = null; //Quita la alerta roja
        state.locked = false; //Desbloquea movimiento
        checkBattleEnd(); 
        render(state);
        
        if (state.phase === 'fighting') scheduleEnemyAttack(); //Programa el siguiente ataque
    }, delay);
    state.timers.push(t); //Guarda el timer para poder cancelarlo
}

//Comprueba si alguien llegó a 0 de vida
function checkBattleEnd() {
    if (state.playerHP <= 0 || state.opponentHP <= 0) {
        state.phase = 'ended'; //Detiene el bucle de juego
        
        state.timers.forEach(clearTimeout); //Detiene todos los procesos pendientes
        document.removeEventListener('keydown', handleKeyDown); //Apaga el teclado

        // Renderizamos para que las barras de vida bajen
        render(state); //Dibuja el resultado final
    }
}

document.addEventListener('DOMContentLoaded', init);