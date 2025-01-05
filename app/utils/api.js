// utils/api.js

export const fetchRecommendations = async (userId, animeList) => {
    try {
      const response = await fetch('/api/users/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          algorithm: 'user-user',
          anime_list: animeList,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        // Handle error responses
        throw new Error(data.error || 'Failed to fetch recommendations');
      }
  
      return data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  };
  