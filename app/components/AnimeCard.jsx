// app/components/AnimeCard.jsx

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";

export default function AnimeCard({ anime }) {
  // We assume the backend returns 'stars' (number),
  // plus 'anime_name', 'genre', etc.
  const {
    anime_id,
    anime_name = "Unknown Anime",
    genre = "Unknown Genre",
    // If your backend is now returning "stars" for both algorithms:
    stars = 1,
  } = anime;

  const [imageUrl, setImageUrl] = useState("/placeholder.svg");

  // We'll clamp the stars to a max of 5, if that makes sense for your UI
  const maxStars = 5;

  const clampedStars = Math.min(stars, maxStars);

  useEffect(() => {
    if (!anime_id && !anime_name) return; // safety check

    async function fetchImage() {
      try {
        // Call your local Next.js route (or external API) to get an image URL
        const res = await fetch(
          `/api/fetch-anime-image?anime_id=${anime_id}&anime_name=${encodeURIComponent(anime_name)}`
        );
        if (!res.ok) throw new Error("Failed to fetch image route");
        const { imageUrl } = await res.json();
        setImageUrl(imageUrl || "/placeholder.svg");
      } catch (error) {
        console.error("Image route failed:", error);
        setImageUrl("/placeholder.svg");
      }
    }

    fetchImage();
  }, [anime_id, anime_name]);

  return (
    <div className="bg-zinc-800 rounded p-4 hover:bg-zinc-700 transition">
      {/* Anime Poster */}
      <div
        className="relative mb-3 aspect-[2/3] bg-black w-full h-0"
        style={{ paddingBottom: "150%" }}
      >
        <Image
          src={imageUrl}
          alt={anime_name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover rounded"
        />
      </div>

      {/* Anime Title */}
      <h3 className="font-bold text-white mb-1 truncate">{anime_name}</h3>

      {/* Genre */}
      <p className="text-sm text-gray-300">Genre: {genre}</p>

      {/* Star Rating (clamped to maxStars) */}
      <div className="flex items-center gap-1 text-yellow-400 mt-2">
        {Array.from({ length: clampedStars }).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-current" />
        ))}
      </div>
    </div>
  );
}
