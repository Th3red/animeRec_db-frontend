// utils/aniListMapper.js

import stringSimilarity from 'string-similarity';

const ANILIST_API_URL = "https://graphql.anilist.co";
const KITSU_API_URL = "https://kitsu.io/api/edge/anime";

/**
 * Fetch the official name from AniList.
 * @param {string} originalName - The original anime name from your database.
 * @returns {Promise<string>} - The official anime name from AniList.
 */
async function fetchAniListName(originalName) {
  const query = `
    query ($search: String) {
      Media(search: $search, type: ANIME) {
        id
        title {
          romaji
          english
          native
        }
      }
    }
  `;
  const variables = { search: originalName };

  try {
    const response = await fetch(ANILIST_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`AniList API failed with status ${response.status}`);
    }

    const result = await response.json();
    const media = result?.data?.Media;

    if (!media) {
      // No results found
      throw new Error("AniList returned no matching media");
    }

    // Determine the best title to use
    const officialName = media.title.english || media.title.romaji || media.title.native || originalName;

    // Calculate similarity
    const similarity = stringSimilarity.compareTwoStrings(originalName.toLowerCase(), officialName.toLowerCase());

    if (similarity >= 0.7) { // 70% similarity threshold
      return officialName;
    } else {
      throw new Error(`AniList name similarity below threshold (${(similarity * 100).toFixed(2)}%)`);
    }

  } catch (error) {
    console.warn(`AniList failed for "${originalName}":`, error.message);
    throw error; // Propagate the error to trigger fallback
  }
}

/**
 * Fetch the official name from Jikan.
 * @param {number} animeId - The anime ID from your database.
 * @returns {Promise<string>} - The official anime name from Jikan.
 */
async function fetchJikanName(animeId) {
  try {
    const response = await fetch(`https://api.jikan.moe/v4/anime/${animeId}`);

    if (!response.ok) {
      throw new Error(`Jikan API failed with status ${response.status} for ID ${animeId}`);
    }

    const data = await response.json();
    const officialName = data?.data?.title || `Anime ID ${animeId}`;

    // Optionally, you can perform a similarity check here as well
    // For simplicity, we'll assume Jikan's title is correct

    return officialName;
  } catch (error) {
    console.warn(`Jikan failed for ID ${animeId}:`, error.message);
    throw error; // Propagate the error to trigger Kitsu fallback
  }
}

/**
 * Fetch the official name from Kitsu.
 * @param {string} originalName - The original anime name from your database.
 * @returns {Promise<string>} - The official anime name from Kitsu.
 */
async function fetchKitsuName(originalName) {
  try {
    const encoded = encodeURIComponent(originalName);
    const url = `${KITSU_API_URL}?filter[text]=${encoded}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Kitsu API failed with status ${response.status}`);
    }

    const data = await response.json();
    const firstAnime = data?.data?.[0];

    if (!firstAnime) {
      throw new Error("No results from Kitsu");
    }

    // Kitsu's canonical title
    const officialName = firstAnime.attributes?.canonicalTitle || originalName;

    // Calculate similarity
    const similarity = stringSimilarity.compareTwoStrings(originalName.toLowerCase(), officialName.toLowerCase());

    if (similarity >= 0.7) { // 70% similarity threshold
      return officialName;
    } else {
      console.warn(`Kitsu name similarity below threshold (${(similarity * 100).toFixed(2)}%) for "${originalName}"`);
      return originalName; // Fallback to original name
    }

  } catch (error) {
    console.warn(`Kitsu fallback failed for "${originalName}":`, error.message);
    // Return original name if both AniList and Kitsu fail
    return originalName;
  }
}

/**
 * Main function to map an array of recommended anime to AniList naming standards with fallbacks.
 * @param {Array<Object>} recommendations - Array of recommended anime objects.
 * @returns {Promise<Array<Object>>} - Array with updated anime names.
 */
export async function mapAnimeToOfficialNames(recommendations) {
  const updatedRecs = [];

  // Optional: Implement caching here to avoid redundant API calls

  for (let anime of recommendations) {
    const { anime_id, anime_name = "Unknown Title" } = anime;

    try {
      // 1. Try AniList
      const aniListName = await fetchAniListName(anime_name);
      updatedRecs.push({
        ...anime,
        anime_name: aniListName,
      });
    } catch (aniListError) {
      try {
        // 2. Fallback to Jikan using anime_id
        const jikanName = await fetchJikanName(anime_id);
        updatedRecs.push({
          ...anime,
          anime_name: jikanName,
        });
      } catch (jikanError) {
        try {
          // 3. Fallback to Kitsu using original name
          const kitsuName = await fetchKitsuName(anime_name);
          updatedRecs.push({
            ...anime,
            anime_name: kitsuName,
          });
        } catch (kitsuError) {
          // 4. Fallback to original name
          updatedRecs.push({
            ...anime,
            anime_name: anime_name, // Already the original name
          });
        }
      }
    }
  }

  return updatedRecs;
}
