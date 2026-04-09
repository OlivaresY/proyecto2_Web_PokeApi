import TRAINER from "../trainer.config.js";

export const state = {
    player: null,
    opponent: null,
    playerHP: 0,
    playerMaxHP: 0,
    opponentHP: 0,
    opponentMaxHP: 0,
    playerPosition: 2, // 1, 2, o 3
    locked: false,
    definitiveUsed: false,
    attackOnCooldown: false,
    phase: 'fighting', 
    log: [],
    incomingAttack: null,
    timers: []
};

export const formulas = {
    playerAttack: (power) => {
        const p = power || 60;
        return Math.floor(p * 0.3) + Math.floor(Math.random() * p * 0.4);
    },
    enemyAttack: (stat) => {
        return Math.floor(stat * 0.4) + Math.floor(Math.random() * 20);
    }
};