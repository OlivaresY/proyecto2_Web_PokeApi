
export const state = {
    player: null,
    opponent: null,
    playerHP: 0,
    playerMaxHP: 0,
    opponentHP: 0,
    opponentMaxHP: 0,
    playerPosition: 2, 
    locked: false,
    definitiveUsed: false,
    attackOnCooldown: false,
    phase: 'fighting', 
    log: [],
    incomingAttack: null,
    timers: []
};

// Funciones matemáticas para calcular el daño
export const formulas = {
    playerAttack: (power) => {
        const p = power || 60; //Poder base o 60 por defecto
        //Cálculo: 30% del poder + un aleatorio del 40% del poder
        return Math.floor(Math.floor(p * 0.3) + Math.floor(Math.random() * p * 0.4));
    },
    enemyAttack: (stat) => {
        //Cálculo basado en el stat de ataque del enemigo + un aleatorio
        return Math.floor(Math.floor(stat * 0.4) + Math.floor(Math.random() * 20));
    }
};

//Función para pausar el código y guardar el registro del tiempo
export const wait = (ms) => new Promise(resolve => {
    const timeout = setTimeout(resolve, ms);
    state.timers.push(timeout); // <--- Esto permite que clearTimeout lo encuentre
});