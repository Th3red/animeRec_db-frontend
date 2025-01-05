import AnimeCard from "./AnimeCard"; // or wherever you placed the new file

const RecommendationsList = ({
  recommendations = [],
  activeGenre = "all",
}) => {
  const filteredRecs = recommendations.filter((anime) => {
    if (activeGenre === "all") return true;
    return anime.genre?.toLowerCase().includes(activeGenre.toLowerCase());
    // or if anime.genres is an array:
    // return anime.genres?.some((g) => g.toLowerCase() === activeGenre);
  });

  if (filteredRecs.length === 0) {
    return (
      <p className="text-gray-300">
        No recommendations available for genre <strong>{activeGenre}</strong>.
      </p>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">
        Recommended Anime (Genre Filter: {activeGenre})
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredRecs.map((anime) => (
          <AnimeCard key={anime.anime_id} anime={anime} />
        ))}
      </div>
    </div>
  );
};

export default RecommendationsList;
