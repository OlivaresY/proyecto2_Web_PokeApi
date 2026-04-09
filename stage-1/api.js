const BASE_URL = "https://pokeapi.co/api/v2/pokemon";

// Fetch Pokémon principal con señal de aborto
export async function fetchPokemon(name, signal = null) {
    const res = await fetch(`${BASE_URL}/${name}`, { signal });
    if (!res.ok) throw new Error("Pokémon no encontrado");
    return await res.json();
}

// Filtra los 5 ataques más fuertes por nivel (4 normales + 1 especial)
export function getValidMoves(data) {
    if (!data || !data.moves) return [];

    const levelUpMoves = data.moves
        .filter(move =>
            move.version_group_details.some(v => v.move_learn_method.name === "level-up")
        )
        .map(move => {
            const minLevel = Math.min(
                ...move.version_group_details
                    .filter(v => v.move_learn_method.name === "level-up")
                    .map(v => v.level_learned_at)
            );
            return { ...move, minLevel };
        });

    levelUpMoves.sort((a, b) => a.minLevel - b.minLevel);
    return levelUpMoves.slice(-5); 
}

// Carga detalles de ataques en paralelo (Robustez técnica)
export async function fetchMovesDetails(moves, signal = null) {
    if (!moves || moves.length === 0) return [];

    return await Promise.allSettled(
        moves.map(move =>
            fetch(move.move.url, { signal }).then(res => {
                if (!res.ok) throw new Error();
                return res.json();
            })
        )
    );
}