// utils/retry.js

export async function retryFetch(url, options = {}, retries = 3, backoff = 300) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        if (!response.ok && response.status >= 500) {
          // Server error, retry
          throw new Error(`Server error: ${response.status}`);
        }
        return response;
      } catch (error) {
        if (i < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, backoff * Math.pow(2, i)));
        } else {
          throw error;
        }
      }
    }
  }
  