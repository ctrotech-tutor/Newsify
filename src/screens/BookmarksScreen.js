import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BookmarksScreen = () => {
  const [bookmarkedArticles, setBookmarkedArticles] = React.useState([]);

  React.useEffect(() => {
    const loadBookmarks = async () => {
      try {
        const storedBookmarks = await AsyncStorage.getItem('bookmarkedArticles');
        if (storedBookmarks !== null) {
          setBookmarkedArticles(JSON.parse(storedBookmarks));
        }
      } catch (error) {
        console.error('Error loading bookmarks:', error);
      }
    };
    loadBookmarks();
  }, []);

  const removeBookmark = async (articleId) => {
    try {
      const updatedBookmarks = bookmarkedArticles.filter(article => article.id !== articleId);
      await AsyncStorage.setItem('bookmarkedArticles', JSON.stringify(updatedBookmarks));
      setBookmarkedArticles(updatedBookmarks);
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  const renderBookmarkItem = ({ item }) => (
    <View style={styles.bookmarkItem}>
      <Text style={styles.bookmarkTitle}>{item.title}</Text>
      <TouchableOpacity onPress={() => removeBookmark(item.id)} style={styles.removeButton}>
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bookmarks</Text>
      {bookmarkedArticles.length > 0 ? (
        <FlatList
          data={bookmarkedArticles}
          renderItem={renderBookmarkItem}
          keyExtractor={(item) => item.id}
        />
      ) : (
        <Text>No bookmarked articles yet.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  bookmarkItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookmarkTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  removeButton: {
    backgroundColor: 'red',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default BookmarksScreen;

