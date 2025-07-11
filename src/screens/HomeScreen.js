import React, { useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import Animated, { useSharedValue, useScrollHandler } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import useNewsStore from '../store/newsStore';
import NewsCard from '../components/NewsCard';
import FeaturedCard from '../components/FeaturedCard';
import { ShimmerCard, ShimmerFeaturedCard } from '../components/ShimmerLoader';

const HomeScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const {
    articles,
    featuredArticle,
    categories,
    selectedCategory,
    loading,
    error,
    hasMore,
    fetchNews,
    setSelectedCategory,
    refreshNews,
    loadCachedData,
  } = useNewsStore();

  const scrollY = useSharedValue(0);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadCachedData();
    fetchNews(selectedCategory, 1, true);
  }, []);

  const scrollHandler = useScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category);
    fetchNews(category, 1, true);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const handleRefresh = useCallback(() => {
    refreshNews();
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchNews(selectedCategory);
    }
  }, [loading, hasMore, selectedCategory]);

  const handleArticlePress = useCallback((article) => {
    navigation.navigate('ArticleDetail', { 
      article,
      articleUrl: article.url 
    });
  }, [navigation]);

  const handleQuickRead = useCallback(() => {
    if (featuredArticle) {
      Alert.alert(
        'Quick Read',
        'This feature will provide an AI-generated summary of the featured article.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Read Summary', onPress: () => {
            // Navigate to AI summary or show modal
            navigation.navigate('AINewsDigest');
          }}
        ]
      );
    }
  }, [featuredArticle, navigation]);

  const renderCategoryChip = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        {
          backgroundColor: selectedCategory === item ? colors.primary : colors.surface,
          borderColor: colors.border,
        },
      ]}
      onPress={() => handleCategorySelect(item)}
    >
      <Text
        style={[
          styles.categoryText,
          {
            color: selectedCategory === item ? '#fff' : colors.text,
          },
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderNewsItem = ({ item, index }) => (
    <NewsCard
      article={item}
      onPress={() => handleArticlePress(item)}
    />
  );

  const renderHeader = () => (
    <View>
      {/* Featured Article */}
      {loading && !featuredArticle ? (
        <ShimmerFeaturedCard />
      ) : featuredArticle ? (
        <FeaturedCard
          article={featuredArticle}
          onPress={() => handleArticlePress(featuredArticle)}
          scrollY={scrollY}
        />
      ) : null}

      {/* Category Filter */}
      <View style={styles.categorySection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Categories
        </Text>
        <FlatList
          data={categories}
          renderItem={renderCategoryChip}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      {/* Section Title */}
      <View style={styles.newsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {selectedCategory === 'All' ? 'Latest News' : `${selectedCategory} News`}
        </Text>
      </View>

      {/* Error Message */}
      {error && (
        <View style={[styles.errorContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.errorText, { color: colors.notification }]}>
            {error}
          </Text>
        </View>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footerLoader}>
        {[...Array(3)].map((_, index) => (
          <ShimmerCard key={index} />
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.FlatList
        ref={flatListRef}
        data={articles}
        renderItem={renderNewsItem}
        keyExtractor={(item, index) => `${item.url}-${index}`}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={loading && articles.length > 0}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleQuickRead}
      >
        <Text style={styles.fabText}>⚡</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  categorySection: {
    paddingVertical: 20,
  },
  newsSection: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoryList: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 14,
  },
  footerLoader: {
    paddingVertical: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 24,
    color: '#fff',
  },
});

export default HomeScreen;

