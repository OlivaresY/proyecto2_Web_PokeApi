const TYPE_INFO = {
    fire: { color: '#ff9c54', emoji: '🔥' }, water: { color: '#4d90d5', emoji: '💧' },
    grass: { color: '#63bb5b', emoji: '🌿' }, electric: { color: '#f3d23b', emoji: '⚡' },
    ice: { color: '#74ced9', emoji: '❄️' }, fighting: { color: '#ce4069', emoji: '🥊' },
    poison: { color: '#ab6ac8', emoji: '🧪' }, ground: { color: '#d97746', emoji: '🏜️' },
    flying: { color: '#8fa8dd', emoji: '🕊️' }, psychic: { color: '#f97176', emoji: '🔮' },
    bug: { color: '#90c12c', emoji: '🐞' }, rock: { color: '#c7b78b', emoji: '🪨' },
    ghost: { color: '#5269ac', emoji: '👻' }, dragon: { color: '#0a6dc4', emoji: '🐲' },
    dark: { color: '#5a5366', emoji: '🌑' }, steel: { color: '#5a8ea1', emoji: '⚙️' },
    fairy: { color: '#ec8fe6', emoji: '✨' }, normal: { color: '#9099a1', emoji: '🔘' }
};

export function renderSkeleton(container) {
    container.style.backgroundColor = '#1a233a';
    container.innerHTML = `
        <div class="skeleton-container">
            <div class="skeleton skeleton-img"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text" style="width: 60%"></div>
        </div>
    `;
}

export function renderPokemon(pokemon, container) {
    const { name, sprites, stats, movesInfo, types } = pokemon;
    const isPlayer = container.id === "player-card";

    const mainType = types[0].type.name;
    const typeData = TYPE_INFO[mainType] || { color: '#9099a1', emoji: '❓' };
    container.style.backgroundColor = typeData.color;

    const hp = isPlayer ? stats.find(s => s.stat.name === "hp").base_stat : "???";
    const attack = isPlayer ? stats.find(s => s.stat.name === "attack").base_stat : "???";
    const defense = isPlayer ? stats.find(s => s.stat.name === "defense").base_stat : "???";
    const energy = isPlayer ? stats.find(s => s.stat.name === "speed").base_stat : "???";

    const normalMoves = movesInfo.slice(0, 4);
    const specialMoveResult = movesInfo[4];

    let specialMoveDisplay = "DESCONOCIDO";
    if (isPlayer && specialMoveResult && specialMoveResult.status === "fulfilled") {
        specialMoveDisplay = specialMoveResult.value.name;
    }

    container.innerHTML = `
        <img src="${sprites.other['official-artwork'].front_default}" alt="${name}" class="pokemon-sprite">
        <h2 style="text-transform: capitalize;">${typeData.emoji} ${name}</h2>
        <div class="pokemon-stats">
            <span>❤️ ${hp}</span><span>⚔️ ${attack}</span>
            <span>🛡️ ${defense}</span><span>⚡ ${energy}</span>
        </div>
        <div class="moves-buttons">
            ${normalMoves.map(res => {
                const moveName = (res.status === "fulfilled") ? res.value.name : "DESCONOCIDO";
                return `<button class="move-btn">${moveName}</button>`;
            }).join('')}
        </div>
        <button class="def-move-btn" style="text-transform: uppercase;">${specialMoveDisplay}</button>
    `;
}