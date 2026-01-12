const BASE_URL = 'https://pokeapi.co/api/v2';

export const getPokemonList = async (limit = 20, offset = 0) => {
  try {
    const response = await fetch(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching pokemon list:', error);
    return null;
  }
};

export const getPokemonDetails = async (url) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching pokemon details:', error);
    return null;
  }
};

export const getPokemonSpecies = async (url) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching pokemon species:', error);
    return null;
  }
}

export const getGenerations = async () => {
  try {
    const response = await fetch(`${BASE_URL}/generation`);
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching generations:', error);
    return [];
  }
};

export const getPokemonByGeneration = async (url) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    // Structure is different: data.pokemon_species
    return data.pokemon_species;
  } catch (error) {
    console.error('Error fetching generation pokemon:', error);
    return [];
  }
};

export const getEvolutionChain = async (url) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching evolution chain:', error);
    return null;
  }
};
