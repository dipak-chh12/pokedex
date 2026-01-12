export const createPokemonCard = (pokemon) => {
    const card = document.createElement('div');
    card.className = 'pokemon-card';
    card.dataset.url = pokemon.url; // Store URL for click handler

    // We need to fetch details to get the image and types for the card
    // To optimize, we could fetch this in the parent, but for simplicity we'll do a quick fetch here
    // OR better, the parent passes the details.
    // Let's assume the parent fetches the details to avoid N+1 fetches causing layout shift too much,
    // but for a simple list, the list endpoint only gives name and url.
    // So we will fetch details here.

    // Placeholder structure
    card.innerHTML = `
    <div class="card-image-container">
        <div class="loader">...</div>
    </div>
    <h3 class="card-name">${pokemon.name}</h3>
  `;

    return card;
};

export const populatePokemonCard = (card, details) => {
    if (!details) return;

    const typesHtml = details.types.map(t =>
        `<span class="type-badge" style="background-color: var(--type-${t.type.name})">${t.type.name}</span>`
    ).join('');

    const imageSrc = details.sprites.other['official-artwork'].front_default || details.sprites.front_default;

    card.innerHTML = `
        <span class="card-id">#${String(details.id).padStart(3, '0')}</span>
        <img src="${imageSrc}" alt="${details.name}" class="card-image" loading="lazy">
        <h3 class="card-name">${details.name}</h3>
        <div class="card-types">
            ${typesHtml}
        </div>
    `;

    // Add type color glow to card
    const mainType = details.types[0].type.name;
    card.style.borderColor = `var(--type-${mainType})`;
    card.style.boxShadow = `0 4px 20px rgba(0,0,0,0.1), inset 0 0 20px var(--type-${mainType}33)`; // 33 is hex opacity
};
