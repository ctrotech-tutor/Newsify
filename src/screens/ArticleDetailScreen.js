import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
  RefreshControl,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../context/ThemeContext';
import useNewsStore from '../store/newsStore';
import { generateSummary } from '../services/geminiApi';

const ArticleDetailScreen = ({ route, navigation }) => {
  const { article, articleUrl } = route.params;
  const { colors, isDark } = useTheme();
  const { addBookmark, removeBookmark, isBookmarked } = useNewsStore();
  
  const [readerMode, setReaderMode] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [summary, setSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const bookmarked = isBookmarked(article.url);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const toggleReaderMode = async () => {
    if (!readerMode && !summary) {
      setLoadingSummary(true);
      const result = await generateSummary(
        `${article.title}\n\n${article.description || ''}\n\n${article.content || ''}`,
        'summary'
      );
      if (result.success) {
        setSummary(result.summary);
      } else {
        setSummary('Unable to generate summary. Please try again later.');
      }
      setLoadingSummary(false);
    }
    setReaderMode(!readerMode);
  };

  const increaseFontSize = () => {
    setFontSize(prevSize => Math.min(prevSize + 2, 24));
  };

  const decreaseFontSize = () => {
    setFontSize(prevSize => Math.max(prevSize - 2, 12));
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${article.title}\n\n${article.url}`,
        url: article.url,
        title: article.title,
      });
    } catch (error) {
      console.error('Error sharing article:', error);
    }
  };

  const handleBookmark = () => {
    if (bookmarked) {
      removeBookmark(article.url);
      Alert.alert('Removed', 'Article removed from bookmarks');
    } else {
      addBookmark(article);
      Alert.alert('Saved', 'Article saved to bookmarks');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderWebView = () => (
    <WebView
      source={{ uri: articleUrl }}
      style={styles.webview}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      startInLoadingState={true}
      scalesPageToFit={true}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
        />
      }
      injectedJavaScript={`
        document.body.style.backgroundColor = '${isDark ? '#121212' : '#ffffff'}';
        document.body.style.color = '${isDark ? '#ffffff' : '#000000'}';
        true;
      `}
    />
  );

  const renderReaderMode = () => (
    <ScrollView 
      style={[styles.readerContainer, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.articleHeader}>
        <Text style={[styles.articleTitle, { fontSize: fontSize + 4, color: colors.text }]}>
          {article.title}
        </Text>
        
        <View style={styles.articleMeta}>
          <Text style={[styles.articleSource, { color: colors.primary }]}>
            {article.source?.name || 'Unknown Source'}
          </Text>
          <Text style={[styles.articleDate, { color: colors.textSecondary }]}>
            {formatDate(article.publishedAt)}
          </Text>
        </View>
        
        {article.author && (
          <Text style={[styles.articleAuthor, { color: colors.textSecondary }]}>
            By {article.author}
          </Text>
        )}
      </View>

      {article.description && (
        <Text style={[styles.articleDescription, { fontSize: fontSize + 1, color: colors.textSecondary }]}>
          {article.description}
        </Text>
      )}

      <View style={styles.summarySection}>
        <Text style={[styles.summaryTitle, { color: colors.text }]}>
          AI Summary
        </Text>
        {loadingSummary ? (
          <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
            Generating summary...
          </Text>
        ) : (
          <Text style={[styles.summaryText, { fontSize, color: colors.text }]}>
            {summary || 'Summary not available'}
          </Text>
        )}
      </View>

      {article.content && (
        <Text style={[styles.articleContent, { fontSize, color: colors.text }]}>
          {article.content}
        </Text>
      )}
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Custom Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.headerButton}
        >
          <Text style={[styles.headerButtonText, { color: colors.text }]}>← Back</Text>
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          Article
        </Text>
        
        <View style={styles.headerRightButtons}>
          <TouchableOpacity onPress={toggleReaderMode} style={styles.headerButton}>
            <Text style={[styles.headerButtonText, { color: colors.primary }]}>
              {readerMode ? 'Web' : 'Reader'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
            <Text style={[styles.headerButtonText, { color: colors.text }]}>Share</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleBookmark} style={styles.headerButton}>
            <Text style={[styles.headerButtonText, { color: bookmarked ? colors.primary : colors.text }]}>
              {bookmarked ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {readerMode ? renderReaderMode() : renderWebView()}

      {/* Font Size Controls (only in reader mode) */}
      {readerMode && (
        <View style={[styles.fontSizeControls, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TouchableOpacity onPress={decreaseFontSize} style={styles.fontSizeButton}>
            <Text style={[styles.fontSizeButtonText, { color: colors.text }]}>A-</Text>
          </TouchableOpacity>
          
          <Text style={[styles.fontSizeText, { color: colors.text }]}>
            Font Size: {fontSize}px
          </Text>
          
          <TouchableOpacity onPress={increaseFontSize} style={styles.fontSizeButton}>
            <Text style={[styles.fontSizeButtonText, { color: colors.text }]}>A+</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50, // Account for status bar
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 5,
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  headerRightButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  webview: {
    flex: 1,
  },
  readerContainer: {
    flex: 1,
    padding: 20,
  },
  articleHeader: {
    marginBottom: 20,
  },
  articleTitle: {
    fontWeight: 'bold',
    lineHeight: 32,
    marginBottom: 12,
  },
  articleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  articleSource: {
    fontSize: 14,
    fontWeight: '600',
  },
  articleDate: {
    fontSize: 12,
  },
  articleAuthor: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  articleDescription: {
    lineHeight: 24,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  summarySection: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summaryText: {
    lineHeight: 24,
  },
  articleContent: {
    lineHeight: 28,
  },
  fontSizeControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderTopWidth: 1,
  },
  fontSizeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginHorizontal: 10,
  },
  fontSizeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  fontSizeText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ArticleDetailScreen;

