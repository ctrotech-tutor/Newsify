const NEWS_API_KEY = "390253ec7c794fda83de25d29469e4c6";
const GNEWS_API_KEY = "b36475c9a94f32d188ac96e305837da6";

export const fetchTopHeadlines = async (category = 
ull
) => {
  try {
    let url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${NEWS_API_KEY}`;
    if (category && category !== 'All') {
      url += `&category=${category}`;
    }
    const response = await fetch(url);
    const data = await response.json();
    if (data.status === 'ok') {
      return data.articles;
    } else {
      console.error('NewsAPI Error:', data.message);
      // Fallback to GNews API if NewsAPI fails
      return fetchGNewsTopHeadlines(category);
    }
  } catch (error) {
    console.error('Error fetching from NewsAPI:', error);
    // Fallback to GNews API on network error
    return fetchGNewsTopHeadlines(category);
  }
};

export const fetchGNewsTopHeadlines = async (category = 
ull
) => {
  try {
    let url = `https://gnews.io/api/v4/top-headlines?lang=en&token=${GNEWS_API_KEY}`;
    if (category && category !== 'All') {
      url += `&topic=${category.toLowerCase()}`;
    }
    const response = await fetch(url);
    const data = await response.json();
    if (data.totalArticles > 0) {
      return data.articles;
    } else {
      console.error('GNews API Error:', data.errors);
      return [];
    }
  } catch (error) {
    console.error('Error fetching from GNews API:', error);
    return [];
  }
};

