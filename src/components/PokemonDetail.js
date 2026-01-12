import { getPokemonSpecies, getEvolutionChain, getPokemonDetails } from '../api/pokeApi.js';

export const createPokemonDetail = async (pokemon, speciesUrl) => {
    // Fetch species data for flavor text and evolution chain
    const species = await getPokemonSpecies(speciesUrl);
    const flavorTextEntry = species.flavor_text_entries.find(entry => entry.language.name === 'en');
    const flavorText = flavorTextEntry ? flavorTextEntry.flavor_text.replace(/\f/g, ' ') : 'No description available.';

    // Fetch Evolution Chain
    let evolutionHtml = '';
    if (species.evolution_chain) {
        const evolutionData = await getEvolutionChain(species.evolution_chain.url);
        evolutionHtml = await buildEvolutionChainHtml(evolutionData.chain);
    }

    const mainType = pokemon.types[0].type.name;
    const imageSrc = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;

    const statsHtml = pokemon.stats.map(stat => {
        const percentage = Math.min(100, (stat.base_stat / 255) * 100);
        return `
            <div class="stat-row">
                <span class="stat-label">${stat.stat.name.replace('-', ' ')}</span>
                <span class="stat-value">${stat.base_stat}</span>
                <div class="stat-bar-bg">
                    <div class="stat-bar-fill" style="width: ${percentage}%; background-color: var(--type-${mainType})"></div>
                </div>
            </div>
        `;
    }).join('');

    const typesHtml = pokemon.types.map(t =>
        `<span class="type-badge" style="background-color: var(--type-${t.type.name})">${t.type.name}</span>`
    ).join('');

    return `
        <div class="modal-visual">
            <div class="modal-bg-text">${pokemon.name}</div>
            <img src="${imageSrc}" alt="${pokemon.name}" class="modal-image">
        </div>
        <div class="modal-info">
            <div class="modal-header">
                <div class="modal-id">#${String(pokemon.id).padStart(3, '0')}</div>
                <h2 class="modal-title">${pokemon.name}</h2>
                <div class="card-types" style="justify-content: flex-start;">
                    ${typesHtml}
                </div>
            </div>
            
            <div class="stats-container">
                ${statsHtml}
            </div>

            <p class="flavor-text">"${flavorText}"</p>

            <div class="evolution-container">
                <h3 class="evolution-title">Evolution Chain</h3>
                <div class="evolution-chain">
                    ${evolutionHtml}
                </div>
            </div>
        </div>
    `;
};

// Helper to build evolution chain HTML recursively
async function buildEvolutionChainHtml(chain) {
    let html = '';
    let current = chain;

    while (current) {
        // We need to fetch the pokemon details to get the image
        // The species URL is in current.species.url. 
        // We can extract ID from URL to get the sprite without a full fetch if we want to optimize,
        // but let's do a quick fetch or use the raw github url pattern for speed if possible.
        // PokeAPI sprites: https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{id}.png

        const speciesUrl = current.species.url;
        const id = speciesUrl.split('/').filter(Boolean).pop();
        const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

        html += `
            <div class="evo-stage">
                <img src="${imageUrl}" alt="${current.species.name}" class="evo-image">
                <span class="evo-name">${current.species.name}</span>
            </div>
        `;

        if (current.evolves_to.length > 0) {
            html += `<div class="evo-arrow">→</div>`;
            // Handle branching evolutions? For now, just take the first one for simplicity
            // or we could loop. Let's loop if multiple, but linear for now.
            // Actually, let's just take the first path to keep UI simple for this task.
            current = current.evolves_to[0];
        } else {
            current = null;
        }
    }
    return html;
}
