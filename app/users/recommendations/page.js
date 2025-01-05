import { fetchAnimeImage } from "../../utils/fetchAnimeImage";
import AnimeCard from "../../components/AnimeCard";
// pages/api/example.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000'); // Replace with your React app's origin
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // ... rest of your API route logic
}
export async function getServerSideProps(context) {
  const { recommendations } = context.query;

  if (!recommendations) {
    return {
      props: { recommendationsWithImages: [], error: "No recommendations provided." },
    };
  }

  try {
    const parsedRecommendations = JSON.parse(recommendations);

    const recommendationsWithImages = await Promise.all(
      parsedRecommendations.map(async (anime) => {
        const imageUrl = await fetchAnimeImage(anime.anime_id, anime.anime_name);
        return { ...anime, imageUrl };
      })
    );

    return {
      props: { recommendationsWithImages, error: null },
    };
  } catch (error) {
    console.error("Error parsing recommendations or fetching images:", error);
    return {
      props: { recommendationsWithImages: [], error: "Invalid recommendations data." },
    };
  }
}

export default function RecommendationsPage({ recommendationsWithImages, error }) {
  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {recommendationsWithImages.map((anime) => (
        <AnimeCard key={anime.anime_id} anime={anime} imageUrl={anime.imageUrl} />
      ))}
    </div>
  );
}

