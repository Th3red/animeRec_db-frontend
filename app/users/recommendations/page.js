// app/users/recommendations/page.jsx
import { fetchRecommendations } from "../../utils/api";
import AnimeCard from "../../components/AnimeCard";

export default async function RecommendationsPage({ searchParams }) {
  const { recommendations } = searchParams;

  if (!recommendations) {
    return <p className="text-red-500">No recommendations provided.</p>;
  }

  let recommendationsWithImages = [];
  let error = null;

  try {
    const parsedRecommendations = JSON.parse(recommendations);
    recommendationsWithImages = await Promise.all(
      parsedRecommendations.map(async (anime) => {
        const imageUrl = await fetchAnimeImage(anime.anime_id, anime.anime_name);
        return { ...anime, imageUrl };
      })
    );
  } catch (err) {
    console.error("Error parsing recommendations or fetching images:", err);
    error = "Invalid recommendations data.";
  }

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
