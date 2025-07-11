import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchTopHeadlines, fetchGNewsTopHeadlines } from '../services/newsApi';

const useNewsStore = create((set, get) => ({
  // State
  articles: [],
  featuredArticle: null,
  categories: ['All', 'Technology', 'Sports', 'Science', 'Health', 'Business', 'Entertainment', 'Politics'],
  selectedCategory: 'All',
  loading: false,
  error: null,
  page: 1,
  hasMore: true,
  searchQuery: '',
  searchResults: [],
  recentSearches: [],
  bookmarks: [],
  cachedArticles: [],

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSelectedCategory: (category) => set({ selectedCategory: category, page: 1, articles: [] }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Fetch news articles
  fetchNews: async (category = 'All', page = 1, refresh = false) => {
    const { articles, loading } = get();
    
    if (loading) return;
    
    set({ loading: true, error: null });
    
    try {
      const newArticles = await fetchTopHeadlines(category === 'All' ? null : category.toLowerCase());
      
      if (newArticles && newArticles.length > 0) {
        // Cache articles for offline use
        await AsyncStorage.setItem('@cached_articles', JSON.stringify(newArticles));
        
        // Set featured article (first article)
        const featuredArticle = newArticles[0];
        const regularArticles = newArticles.slice(1);
        
        set({
          articles: refresh ? regularArticles : [...articles, ...regularArticles],
          featuredArticle: refresh ? featuredArticle : (get().featuredArticle || featuredArticle),
          cachedArticles: newArticles,
          loading: false,
          hasMore: newArticles.length >= 10,
          page: page + 1
        });
      } else {
        set({ loading: false, hasMore: false });
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      
      // Try to load cached articles
      try {
        const cached = await AsyncStorage.getItem('@cached_articles');
        if (cached) {
          const cachedArticles = JSON.parse(cached);
          set({
            articles: cachedArticles.slice(1),
            featuredArticle: cachedArticles[0],
            loading: false,
            error: 'Using cached articles (offline mode)'
          });
        } else {
          set({ loading: false, error: 'Failed to fetch news and no cached articles available' });
        }
      } catch (cacheError) {
        set({ loading: false, error: 'Failed to fetch news' });
      }
    }
  },

  // Search articles
  searchArticles: async (query) => {
    if (!query.trim()) {
      set({ searchResults: [] });
      return;
    }

    set({ loading: true });
    
    try {
      // Add to recent searches
      const { recentSearches } = get();
      const updatedSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
      set({ recentSearches: updatedSearches });
      await AsyncStorage.setItem('@recent_searches', JSON.stringify(updatedSearches));

      // Search in cached articles first
      const { cachedArticles } = get();
      const filteredResults = cachedArticles.filter(article =>
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        (article.description && article.description.toLowerCase().includes(query.toLowerCase()))
      );

      set({ searchResults: filteredResults, loading: false });
    } catch (error) {
      console.error('Error searching articles:', error);
      set({ loading: false, error: 'Search failed' });
    }
  },

  // Bookmark management
  addBookmark: async (article) => {
    const { bookmarks } = get();
    const isAlreadyBookmarked = bookmarks.some(b => b.url === article.url);
    
    if (!isAlreadyBookmarked) {
      const updatedBookmarks = [...bookmarks, { ...article, bookmarkedAt: new Date().toISOString() }];
      set({ bookmarks: updatedBookmarks });
      await AsyncStorage.setItem('@bookmarks', JSON.stringify(updatedBookmarks));
    }
  },

  removeBookmark: async (articleUrl) => {
    const { bookmarks } = get();
    const updatedBookmarks = bookmarks.filter(b => b.url !== articleUrl);
    set({ bookmarks: updatedBookmarks });
    await AsyncStorage.setItem('@bookmarks', JSON.stringify(updatedBookmarks));
  },

  isBookmarked: (articleUrl) => {
    const { bookmarks } = get();
    return bookmarks.some(b => b.url === articleUrl);
  },

  // Load cached data
  loadCachedData: async () => {
    try {
      const [cachedArticles, recentSearches, bookmarks] = await Promise.all([
        AsyncStorage.getItem('@cached_articles'),
        AsyncStorage.getItem('@recent_searches'),
        AsyncStorage.getItem('@bookmarks')
      ]);

      if (cachedArticles) {
        const articles = JSON.parse(cachedArticles);
        set({
          cachedArticles: articles,
          articles: articles.slice(1),
          featuredArticle: articles[0]
        });
      }

      if (recentSearches) {
        set({ recentSearches: JSON.parse(recentSearches) });
      }

      if (bookmarks) {
        set({ bookmarks: JSON.parse(bookmarks) });
      }
    } catch (error) {
      console.error('Error loading cached data:', error);
    }
  },

  // Refresh news
  refreshNews: async () => {
    const { selectedCategory } = get();
    await get().fetchNews(selectedCategory, 1, true);
  }
}));

export default useNewsStore;

