import React from 'react';
import AnimeSuggestions from './AnimeSuggestions'; // Adjust the import path

const ParentComponent = () => {
  const handleAnimeSelection = (animeId) => {
    console.log('Selected Anime ID:', animeId);
    // Add logic to handle the selected anime ID
  };

  return (
    <div>
      <h1>Anime Recommendations</h1>
      <AnimeSuggestions value="" onChange={handleAnimeSelection} />
    </div>
  );
};

export default ParentComponent;
