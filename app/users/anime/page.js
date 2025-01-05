"use client";

import { useState } from "react";
import { useAnime } from "../../../context/AnimeContext";
import DebugContext from "../../../context/debugComponent";
import AnimeSuggestions from "../../components/AnimeSuggestions";
import RecommendationsList from "../../components/RecommendationsList";
import MALFavorites from "../../components/MALFavorites";

export default function Home() {
  const { topAnime, setTopAnime } = useAnime();
  const [submitted, setSubmitted] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [userId, setUserId] = useState(() => Math.floor(Math.random() * 1000000));
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("user-user");

  // Helper function to ensure topAnime always has up to `max` slots
  // This ensures we can safely add new anime entries without index issues
  const ensureTopAnimeSize = (newArray, max = 10) => {
    // If newArray has more than `max`, slice it
    if (newArray.length > max) {
      return newArray.slice(0, max);
    }
    return newArray;
  };

  // Callback for MALFavorites
  const handleFavoritesFetched = (malFavorites) => {
    // We want to fill existing empty slots in `topAnime` with MAL favorites
    const newTopAnime = [...topAnime];

    // For each MAL favorite, if there's an empty slot, replace it
    // else, if we still have <10 total, push it
    let favIndex = 0;
    for (let i = 0; i < newTopAnime.length; i++) {
      if (!newTopAnime[i].name?.trim() && favIndex < malFavorites.length) {
        newTopAnime[i].name = malFavorites[favIndex].title;
        favIndex++;
      }
    }

    // If we still have more MAL favorites and haven't reached 10,
    // continue appending
    while (favIndex < malFavorites.length && newTopAnime.length < 10) {
      newTopAnime.push({
        name: malFavorites[favIndex].title,
        rank: newTopAnime.length + 1,
      });
      favIndex++;
    }

    // Reassign ranks in case the array grew
    const updated = newTopAnime.map((anime, idx) => ({
      ...anime,
      rank: idx + 1,
    }));

    setTopAnime(ensureTopAnimeSize(updated));
  };

  // Handle typed suggestions
  const handleInputChange = (index, value) => {
    const newTopAnime = [...topAnime];
    newTopAnime[index].name = value;
    setTopAnime(newTopAnime);
  };

  // Load test data
  const handleLoadTestData = () => {
    const testAnime = [
      { name: "Clannad", rank: 1 },
      { name: "Little Busters!", rank: 2 },
      { name: "Attack on Titan", rank: 3 },
      { name: "Death Note", rank: 4 },
      { name: "Steins;Gate", rank: 5 },
      { name: "Full Metal Alchemist Brotherhood", rank: 6 },
      { name: "Sword Art Online", rank: 7 },
      { name: "Demon Slayer", rank: 8 },
      { name: "Death Parade", rank: 9 },
      { name: "Samurai Champloo", rank: 10 },
    ];
    setTopAnime(testAnime);
  };

  // Add anime slot
  const addAnime = () => {
    if (topAnime.length < 10) {
      setTopAnime([
        ...topAnime,
        { name: "", rank: topAnime.length + 1 },
      ]);
    }
  };

  // Two-step fetch approach
  const fetchRecommendations = async () => {
    try {
      const payload = {
        user_id: userId,
        algorithm: selectedAlgorithm,
        anime_list: topAnime,
      };

      // First request
      let response = await fetch("/api/users/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      let firstResult = await response.json();
      console.log("First request result: ", firstResult);

      // Second request
      response = await fetch("/api/users/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      let secondResult = await response.json();
      console.log(`Second request (actual) from ${selectedAlgorithm}`, secondResult);

      setRecommendations(secondResult);
      setSubmitted(true);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Enforce min 5, max 10
    const filledAnime = topAnime.filter((anime) => anime.name.trim());
    if (filledAnime.length < 5) {
      alert("Please provide at least 5 anime before submitting!");
      return;
    }
    if (filledAnime.length > 10) {
      alert("You can only list a maximum of 10 anime!");
      return;
    }

    fetchRecommendations();
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-900 text-white px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Your Anime Picks (5-10 slots)</h1>
        <p className="text-sm text-gray-400">
          Add or fetch your favorite anime, then get personalized recommendations.
        </p>
      </header>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {topAnime.map((anime, index) => (
            <div key={index} className="flex items-center gap-2">
              <label className="w-20 font-semibold text-gray-200">
                Rank {index + 1}:
              </label>
              <AnimeSuggestions
                index={index}
                value={anime.name}
                onChange={(value) => handleInputChange(index, value)}
              />
            </div>
          ))}

          {topAnime.length < 10 && (
            <button
              type="button"
              onClick={addAnime}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white transition"
            >
              Add Anime
            </button>
          )}

          {/* Algorithm Select */}
          <div className="pt-4">
            <label htmlFor="algorithm" className="font-semibold">
              Choose Recommendation Algorithm:
            </label>
            <select
              id="algorithm"
              value={selectedAlgorithm}
              onChange={(e) => setSelectedAlgorithm(e.target.value)}
              className="ml-2 rounded bg-zinc-800 text-white px-2 py-1"
            >
              <option value="user-user">User-User Collaborative Filtering</option>
              <option value="content-based">Content-Based</option>
            </select>
            <button
              type="button"
              onClick={handleLoadTestData}
              className="ml-4 px-2 py-1 bg-gray-600 rounded hover:bg-gray-500 transition"
            >
              Load Test Data
            </button>
          </div>

          <MALFavorites onFavoritesFetched={handleFavoritesFetched} />

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white transition mt-4"
          >
            Submit
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Thank you for submitting your anime list!</h2>
          <ul className="list-disc ml-5 text-gray-200 space-y-1">
            {topAnime.map((anime, index) => (
              <li key={index}>
                <span className="font-bold">Rank {index + 1}:</span> {anime.name}
              </li>
            ))}
          </ul>
          <RecommendationsList recommendations={recommendations} />
          <button
            onClick={() => setSubmitted(false)}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white transition"
          >
            Edit Anime List
          </button>
        </div>
      )}

      <DebugContext />
    </div>
  );
}
