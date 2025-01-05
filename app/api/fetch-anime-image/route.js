// app/api/fetch-anime-image/route.js

import { NextResponse } from "next/server";
import { retryFetch } from "../../utils/retry"; // Adjust the path as needed

const fallbackImage = "/placeholder.svg";

async function fetchFromAniList(animeName) {
  const ANILIST_API_URL = "https://graphql.anilist.co";
  const query = `
    query ($search: String) {
      Media(search: $search, type: ANIME) {
        coverImage {
          large
        }
      }
    }
  `;
  const variables = { search: animeName };

  try {
    const response = await retryFetch(ANILIST_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    }, 3, 500); // 3 retries, starting with 500ms backoff

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`AniList API failed for "${animeName}" with status ${response.status}: ${errorBody}`);
      throw new Error("AniList API failed");
    }

    const result = await response.json();
    return result?.data?.Media?.coverImage?.large || fallbackImage;
  } catch (error) {
    console.warn(`AniList fetch error for "${animeName}":`, error.message);
    throw error;
  }
}

async function fetchFromJikan(animeId) {
  try {
    const resp = await retryFetch(`https://api.jikan.moe/v4/anime/${animeId}`, {}, 3, 500);

    if (!resp.ok) {
      const errorBody = await resp.text();
      console.error(`Jikan API failed for ID ${animeId} with status ${resp.status}: ${errorBody}`);
      throw new Error(`Jikan API failed for ID ${animeId}`);
    }

    const data = await resp.json();
    return (
      data?.data?.images?.jpg?.large_image_url ||
      data?.data?.images?.jpg?.image_url ||
      fallbackImage
    );
  } catch (error) {
    console.warn(`Jikan fetch error for ID ${animeId}:`, error.message);
    throw error;
  }
}

async function fetchFromKitsu(animeName) {
  const KITSU_API_URL = "https://kitsu.io/api/edge/anime";
  const encoded = encodeURIComponent(animeName);
  const url = `${KITSU_API_URL}?filter[text]=${encoded}`;

  try {
    const response = await retryFetch(url, {}, 3, 500);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Kitsu API failed for "${animeName}" with status ${response.status}: ${errorBody}`);
      throw new Error("Kitsu API failed");
    }

    const data = await response.json();
    const firstAnime = data?.data?.[0];

    if (!firstAnime) {
      console.error(`No results from Kitsu for "${animeName}"`);
      throw new Error("No results from Kitsu");
    }

    // Kitsu's original image link is in `attributes.posterImage.original`
    return firstAnime.attributes?.posterImage?.original || fallbackImage;
  } catch (error) {
    console.warn(`Kitsu fetch error for "${animeName}":`, error.message);
    return fallbackImage; // Return placeholder if Kitsu fails
  }
}

/**
 * GET /api/fetch-anime-image?anime_id=XXX&anime_name=YYY
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const animeId = searchParams.get("anime_id") || "";
  const animeName = searchParams.get("anime_name") || "";

  if (!animeId && !animeName) {
    console.error("No anime_id or anime_name provided in the request.");
    return NextResponse.json({ imageUrl: fallbackImage });
  }

  try {
    let imageUrl = fallbackImage;

    // 1. Try AniList if animeName is provided
    if (animeName) {
      try {
        imageUrl = await fetchFromAniList(animeName);
        if (imageUrl !== fallbackImage) {
          return NextResponse.json({ imageUrl });
        }
      } catch (aniListError) {
        console.warn(`AniList fallback failed for "${animeName}".`);
      }
    }

    // 2. Try Jikan if animeId is provided
    if (animeId) {
      try {
        imageUrl = await fetchFromJikan(animeId);
        if (imageUrl !== fallbackImage) {
          return NextResponse.json({ imageUrl });
        }
      } catch (jikanError) {
        console.warn(`Jikan fallback failed for ID ${animeId}.`);
      }
    }

    // 3. Fallback to Kitsu if AniList and Jikan failed
    if (animeName) {
      try {
        imageUrl = await fetchFromKitsu(animeName);
        return NextResponse.json({ imageUrl });
      } catch (kitsuError) {
        console.warn(`Kitsu fallback failed for "${animeName}".`);
      }
    }

    // 4. If all fail, return placeholder
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Error in fetch-anime-image route:", error.message);
    return NextResponse.json({ imageUrl: fallbackImage });
  }
}
