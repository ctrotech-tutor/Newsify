import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import useNewsStore from '../store/newsStore';

const NewsCard = ({ article, onPress, showBookmark = true }) => {
  const { colors } = useTheme();
  const { addBookmark, removeBookmark, isBookmarked } = useNewsStore();
  const bookmarked = isBookmarked(article.url);

  const handleBookmark = () => {
    if (bookmarked) {
      removeBookmark(article.url);
    } else {
      addBookmark(article);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {article.urlToImage && (
        <Image
          source={{ uri: article.urlToImage }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {article.title}
        </Text>
        
        {article.description && (
          <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={3}>
            {article.description}
          </Text>
        )}
        
        <View style={styles.footer}>
          <View style={styles.sourceInfo}>
            <Text style={[styles.source, { color: colors.primary }]}>
              {article.source?.name || 'Unknown Source'}
            </Text>
            <Text style={[styles.date, { color: colors.textSecondary }]}>
              {formatDate(article.publishedAt)}
            </Text>
          </View>
          
          {showBookmark && (
            <TouchableOpacity onPress={handleBookmark} style={styles.bookmarkButton}>
              <Text style={[styles.bookmarkIcon, { color: bookmarked ? colors.primary : colors.textSecondary }]}>
                {bookmarked ? '★' : '☆'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 22,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceInfo: {
    flex: 1,
  },
  source: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  date: {
    fontSize: 11,
  },
  bookmarkButton: {
    padding: 8,
  },
  bookmarkIcon: {
    fontSize: 20,
  },
});

export default NewsCard;

