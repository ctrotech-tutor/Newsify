import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import useNewsStore from '../store/newsStore';
import NewsCard from '../components/NewsCard';
import { ShimmerCard } from '../components/ShimmerLoader';

const SearchScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const {
    searchQuery,
    searchResults,
    recentSearches,
    loading,
    setSearchQuery,
    searchArticles,
  } = useNewsStore();

  const [localQuery, setLocalQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    // Generate suggestions based on recent searches and popular topics
    const popularTopics = [
      'Technology', 'AI', 'Climate Change', 'Sports', 'Politics',
      'Health', 'Science', 'Business', 'Entertainment', 'World News'
    ];
    
    const allSuggestions = [...recentSearches, ...popularTopics]
      .filter(item => item.toLowerCase().includes(localQuery.toLowerCase()))
      .slice(0, 8);
    
    setSuggestions(allSuggestions);
  }, [localQuery, recentSearches]);

  const handleSearch = useCallback((query) => {
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      setSearchQuery(trimmedQuery);
      searchArticles(trimmedQuery);
      setLocalQuery(trimmedQuery);
    }
  }, [setSearchQuery, searchArticles]);

  const handleSuggestionPress = useCallback((suggestion) => {
    handleSearch(suggestion);
  }, [handleSearch]);

  const handleArticlePress = useCallback((article) => {
    navigation.navigate('ArticleDetail', { 
      article,
      articleUrl: article.url 
    });
  }, [navigation]);

  const renderSuggestion = ({ item }) => (
    <TouchableOpacity
      style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
      onPress={() => handleSuggestionPress(item)}
    >
      <Text style={[styles.suggestionText, { color: colors.text }]}>
        {item}
      </Text>
      <Text style={styles.suggestionIcon}>→</Text>
    </TouchableOpacity>
  );

  const renderRecentSearch = ({ item }) => (
    <TouchableOpacity
      style={[styles.recentSearchChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => handleSuggestionPress(item)}
    >
      <Text style={[styles.recentSearchText, { color: colors.text }]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderSearchResult = ({ item }) => (
    <NewsCard
      article={item}
      onPress={() => handleArticlePress(item)}
    />
  );

  const showSuggestions = localQuery.length > 0 && !searchQuery;
  const showResults = searchQuery.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Header */}
      <View style={[styles.searchHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.searchInputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.searchIcon, { color: colors.textSecondary }]}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search news..."
            placeholderTextColor={colors.textSecondary}
            value={localQuery}
            onChangeText={setLocalQuery}
            onSubmitEditing={() => handleSearch(localQuery)}
            returnKeyType="search"
          />
          {localQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setLocalQuery('');
                setSearchQuery('');
              }}
              style={styles.clearButton}
            >
              <Text style={[styles.clearButtonText, { color: colors.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      {showSuggestions ? (
        // Auto-suggestions
        <FlatList
          data={suggestions}
          renderItem={renderSuggestion}
          keyExtractor={(item, index) => `suggestion-${index}`}
          style={styles.suggestionsList}
          showsVerticalScrollIndicator={false}
        />
      ) : showResults ? (
        // Search Results
        <View style={styles.resultsContainer}>
          <Text style={[styles.resultsHeader, { color: colors.text }]}>
            {searchResults.length} results for "{searchQuery}"
          </Text>
          {loading ? (
            <ScrollView>
              {[...Array(5)].map((_, index) => (
                <ShimmerCard key={index} />
              ))}
            </ScrollView>
          ) : (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item, index) => `result-${index}`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.resultsList}
            />
          )}
        </View>
      ) : (
        // Default State - Recent & Trending
        <ScrollView style={styles.defaultContainer} showsVerticalScrollIndicator={false}>
          {recentSearches.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Recent Searches
              </Text>
              <FlatList
                data={recentSearches}
                renderItem={renderRecentSearch}
                keyExtractor={(item, index) => `recent-${index}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recentSearchesList}
              />
            </View>
          )}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Trending Topics
            </Text>
            <View style={styles.trendingGrid}>
              {['Technology', 'Climate Change', 'Sports', 'Politics', 'Health', 'Science'].map((topic, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.trendingTopic, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => handleSuggestionPress(topic)}
                >
                  <Text style={[styles.trendingTopicText, { color: colors.text }]}>
                    {topic}
                  </Text>
                  <Text style={[styles.trendingIcon, { color: colors.primary }]}>📈</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchHeader: {
    padding: 16,
    borderBottomWidth: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 16,
  },
  suggestionsList: {
    flex: 1,
  },
  suggestionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  suggestionText: {
    fontSize: 16,
  },
  suggestionIcon: {
    fontSize: 16,
    color: '#999',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    fontSize: 16,
    fontWeight: '600',
    padding: 16,
  },
  resultsList: {
    paddingBottom: 20,
  },
  defaultContainer: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  recentSearchesList: {
    paddingRight: 16,
  },
  recentSearchChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  recentSearchText: {
    fontSize: 14,
  },
  trendingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  trendingTopic: {
    width: '48%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  trendingTopicText: {
    fontSize: 14,
    fontWeight: '600',
  },
  trendingIcon: {
    fontSize: 16,
  },
});

export default SearchScreen;

