  //URL base de la API de Pokemon
const BASE_URL = "https://pokeapi.co/api/v2/pokemon";

//Función asíncrona para buscar un Pokemon por nombre
export async function fetchPokemon(name, signal = null) { //signal se usa para poder cancelar la petición (útil cuando escribes rápido en un buscador
    const res = await fetch(`${BASE_URL}/${name}`, { signal }); //Hace la petición a la API: si name = a -> x, llama a -> x
    if (!res.ok) throw new Error("Pokémon no encontrado"); // Si la respuesta falla, lanza un error
    return await res.json(); //Convierte la respuesta en JSON y la devuelve -> aqui se obtiene todos los datos de pokemon
}

export function getValidMoves(data) { //Función que filtra y selecciona los movimientos correctos del Pokemon
    if (!data || !data.moves) return [];//Validación: si no hay datos o no hay movimientos → devuelve un arreglo vacío.
    const levelUpMoves = data.moves // Se emepieza con todos los movimientos del Pokemon.
        .filter(move => move.version_group_details.some(v => v.move_learn_method.name === "level-up"))
        .map(move => {
            const minLevel = Math.min(...move.version_group_details
                .filter(v => v.move_learn_method.name === "level-up")
                .map(v => v.level_learned_at));
            return { ...move, minLevel };
        });
    levelUpMoves.sort((a, b) => a.minLevel - b.minLevel); //Ordenas los movimientos de menor nivel a mayor nivel.
    return levelUpMoves.slice(-5); //Tomas solo los últimos 5 movimientos (los de nivel más alto).
}

export async function fetchMovesDetails(moves, signal = null) {
    if (!moves || moves.length === 0) return []; //Si no hay movimientos → devuelve vacío
    return await Promise.allSettled( //Ejecuta TODAS las peticiones al mismo tiempo (más rápido). // allSettled permite que aunque una falle, las demás sigan.
        moves.map(move => fetch(move.move.url, { signal }).then(res => res.json()))
    );
}