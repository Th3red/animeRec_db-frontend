export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000'); // Replace with your React app's origin
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
    // ... rest of your API route logic
  }
  export async function fetchAnimeImage(animeId, animeName) {
    const fallbackImage = "/placeholder.svg";
  
    // Try fetching from Jikan API
    try {
      const resp = await fetch(https:api.jikan.moe/v4/anime/${animeId});
      if (resp.ok) {
        const data = await resp.json();
        return (
          data?.data?.images?.jpg?.large_image_url ||
          data?.data?.images?.jpg?.image_url ||
          fallbackImage
        );
      }
      throw new Error("Jikan API failed");
    } catch {
      console.warn(Jikan failed for anime ID: ${animeId}, trying AniList...);
  
      // Fallback to AniList
      try {
        const ANILIST_API_URL = "https://graphql.anilist.co";
        const query = 
          query ($search: String) {
            Media(search: $search, type: ANIME) {
              coverImage {
                large
              }
            }
          }
        ;
        const variables = { search: animeName };
  
        const aniListResp = await fetch(ANILIST_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, variables }),
        });
  
        const aniListData = await aniListResp.json();
        return aniListData?.data?.Media?.coverImage?.large || fallbackImage;
      } catch (aniListError) {
        console.error("Both APIs failed for:", animeName);
        return fallbackImage;
      }
    }
  