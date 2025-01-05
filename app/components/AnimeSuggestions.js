import { useState, useEffect } from "react";

const AnimeSuggestions = ({ index, value, onChange }) => {
  const [query, setQuery] = useState(value); 
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Hide suggestions on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(`.anime-suggestions-${index}`)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [index]);

  // Fetch suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim() === "") {
        setSuggestions([]);
        return;
      }
      try {
        const response = await fetch(`/api/anime-suggestions?query=${query}`);
        let data = await response.json();
        data = data.filter(
          (anime) => anime.toLowerCase() !== query.toLowerCase()
        );
        setSuggestions(data.slice(0, 5));
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    };
    fetchSuggestions();
  }, [query]);

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setSuggestions([]);
    onChange(suggestion);
  };

  return (
    <div style={{ position: "relative" }} className={`anime-suggestions-${index}`}>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          const newValue = e.target.value;
          setQuery(newValue);
          onChange(newValue);
        }}
        placeholder={`Anime ${index + 1}`}
        className="px-2 py-1 w-60 bg-zinc-800 text-white border border-gray-600 rounded"
      />
      {suggestions.length > 0 && (
        <ul
          className="absolute mt-1 w-60 bg-zinc-800 border border-gray-600 rounded shadow-lg z-50"
          style={{ listStyleType: "none", padding: 0, maxHeight: "200px", overflowY: "auto" }}
        >
          {suggestions.map((anime, i) => (
            <li
              key={i}
              onClick={() => handleSuggestionClick(anime)}
              className="cursor-pointer px-2 py-1 hover:bg-zinc-700 text-white"
            >
              {anime}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AnimeSuggestions;
