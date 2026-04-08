const BASE_URL = "https://pokeapi.co/api/v2/pokemon";

// Delay helper (para simular carga)
export const delay = (ms) => new Promise(res => setTimeout(res, ms));

// Fetch Pokémon (player y opponent)
export async function fetchPokemon(name, signal = null) {
  const res = await fetch(`${BASE_URL}/${name}`, { signal });

  if (!res.ok) {
    throw new Error("Pokémon no encontrado");
  }

  return await res.json();
}

// 🔥 FILTRAR SOLO MOVES POR NIVEL Y ASEGURAR 4
export function getValidMoves(data) {
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

  return levelUpMoves.slice(-4);
}

// 🔥 DETALLES DE MOVIMIENTOS (Promise.allSettled)
export async function fetchMovesDetails(moves) {
  return await Promise.allSettled(
    moves.map(move =>
      fetch(move.move.url).then(res => res.json())
    )
  );
}