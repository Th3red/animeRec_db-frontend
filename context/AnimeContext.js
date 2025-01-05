'use client'
import React, { createContext, useState, useContext } from 'react';

const AnimeContext = createContext();

export const AnimeProvider = ({ children }) => {
  const [topAnime, setTopAnime] = useState([{ name: '', rank: 1 }]);

  return (
    <AnimeContext.Provider value={{ topAnime, setTopAnime }}>
      {children}
    </AnimeContext.Provider>
  );
};

export const useAnime = () => useContext(AnimeContext);
