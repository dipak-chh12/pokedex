import './style.css';
import { getPokemonList, getPokemonDetails, getGenerations, getPokemonByGeneration } from './api/pokeApi.js';
import { createPokemonCard, populatePokemonCard } from './components/PokemonCard.js';
import { createPokemonDetail } from './components/PokemonDetail.js';

const app = document.querySelector('#app');
const LIMIT = 20;
let offset = 0;
let isLoading = false;
let allPokemon = []; // Store fetched pokemon for search
let currentMode = 'infinite'; // 'infinite' or 'generation'

// Initial Layout
app.innerHTML = `
  <header>
    <h1>Pokedex</h1>
    <div class="search-container">
      <input type="text" id="search" class="search-input" placeholder="Search Pokemon...">
      <div class="controls-container">
        <button id="search-btn" class="search-btn">Search</button>
        <select id="gen-filter" class="filter-select">
            <option value="">All Generations</option>
        </select>
      </div>
    </div>
  </header>
  <main>
    <div id="grid" class="pokemon-grid"></div>
    <div id="loader" class="loader" style="display: none;">Loading more...</div>
  </main>
  <div id="modal-overlay" class="modal-overlay">
    <div class="modal-content">
        <button class="close-btn">&times;</button>
        <div id="modal-body" class="modal-body"></div>
    </div>
  </div>
`;

const grid = document.getElementById('grid');
const loader = document.getElementById('loader');
const searchInput = document.getElementById('search');
const searchBtn = document.getElementById('search-btn');
const genFilter = document.getElementById('gen-filter');
const modalOverlay = document.getElementById('modal-overlay');
const modalBody = document.getElementById('modal-body');
const closeBtn = document.querySelector('.close-btn');

// Populate Generations
const initGenerations = async () => {
    const generations = await getGenerations();
    generations.forEach(gen => {
        const option = document.createElement('option');
        option.value = gen.url;
        option.textContent = gen.name.replace('generation-', 'Gen ').toUpperCase();
        genFilter.appendChild(option);
    });
};

// Load Pokemon (Infinite Scroll)
const loadPokemon = async () => {
    if (isLoading || currentMode === 'generation') return;
    isLoading = true;
    loader.style.display = 'block';

    const data = await getPokemonList(LIMIT, offset);

    if (data && data.results) {
        await renderPokemonList(data.results);
        offset += LIMIT;
    }

    isLoading = false;
    loader.style.display = 'none';
};

// Load Pokemon by Generation
const loadGenerationPokemon = async (url) => {
    isLoading = true;
    loader.style.display = 'block';
    grid.innerHTML = ''; // Clear grid
    allPokemon = []; // Clear search cache
    currentMode = 'generation';

    const speciesList = await getPokemonByGeneration(url);
    // Species list needs to be converted to pokemon urls (species url -> pokemon url logic is tricky as IDs match usually)
    // Actually, species list has name and url. URL is for species.
    // We need to fetch pokemon details.
    // Let's just use the species name to fetch pokemon details.

    // Sort by ID (extracted from URL)
    speciesList.sort((a, b) => {
        const idA = parseInt(a.url.split('/').filter(Boolean).pop());
        const idB = parseInt(b.url.split('/').filter(Boolean).pop());
        return idA - idB;
    });

    // Render in chunks to avoid freezing
    const chunk = 20;
    for (let i = 0; i < speciesList.length; i += chunk) {
        const batch = speciesList.slice(i, i + chunk).map(s => ({
            name: s.name,
            url: `https://pokeapi.co/api/v2/pokemon/${s.name}` // Construct pokemon URL
        }));
        await renderPokemonList(batch);
    }

    isLoading = false;
    loader.style.display = 'none';
};

const renderPokemonList = async (list) => {
    for (const pokemon of list) {
        const card = createPokemonCard(pokemon);
        grid.appendChild(card);

        // Fetch details for card
        getPokemonDetails(pokemon.url).then(details => {
            if (!details) return; // Handle 404s (e.g. variant species)
            populatePokemonCard(card, details);
            card.onclick = () => openModal(details);

            // Store for search
            allPokemon.push({ name: pokemon.name, details, card });
        });
    }
};

// Infinite Scroll
window.addEventListener('scroll', () => {
    if (currentMode === 'infinite' && window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        loadPokemon();
    }
});

// Search Logic
const performSearch = () => {
    const term = searchInput.value.toLowerCase();
    const cards = document.querySelectorAll('.pokemon-card');

    cards.forEach(card => {
        const name = card.querySelector('.card-name').textContent.toLowerCase();
        if (name.includes(term)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
};

searchInput.addEventListener('input', performSearch); // Real-time
searchBtn.addEventListener('click', performSearch); // Button click

// Filter Logic
genFilter.addEventListener('change', (e) => {
    const url = e.target.value;
    if (url) {
        loadGenerationPokemon(url);
    } else {
        // Reset to infinite scroll
        currentMode = 'infinite';
        offset = 0;
        grid.innerHTML = '';
        allPokemon = [];
        loadPokemon();
    }
});

// Modal Logic
const openModal = async (pokemon) => {
    modalBody.innerHTML = '<div class="loader">Loading details...</div>';
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    const content = await createPokemonDetail(pokemon, pokemon.species.url);
    modalBody.innerHTML = content;
};

const closeModal = () => {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
};

closeBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});

// Initial Load
initGenerations();
loadPokemon();
