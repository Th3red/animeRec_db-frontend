'use client';

import { useState } from 'react';

export default function MALFavorites({ onFavoritesFetched }) {
  const [malUsername, setMalUsername] = useState('');
  const [favorites, setFavorites] = useState([]);

  const fetchUserFavorites = async () => {
    if (!malUsername.trim()) {
      alert('Please enter a MyAnimeList username');
      return;
    }

    try {
      const response = await fetch(`https://api.jikan.moe/v4/users/${malUsername}/favorites`);
      if (!response.ok) {
        throw new Error(`Failed to fetch favorites for user: ${malUsername}`);
      }
      const data = await response.json();
      const animeFavorites = data.data?.anime || [];
      setFavorites(animeFavorites);
      // Call the parent's callback with the fetched favorites
      onFavoritesFetched(animeFavorites);
    } catch (error) {
      console.error('Error fetching user favorites:', error);
      alert(error.message);
    }
  };

  return (
    <div>
      <h2>Import Favorites from MAL</h2>
      <div>
        <input
          type="text"
          placeholder="Enter MAL username"
          value={malUsername}
          onChange={(e) => setMalUsername(e.target.value)}
        />
        <button onClick={fetchUserFavorites}>Fetch Favorites</button>
      </div>

      {favorites.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <h3>{malUsername}'s Favorite Anime</h3>
          <ul>
            {favorites.map((anime) => (
              <li key={anime.mal_id}>{anime.title}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
