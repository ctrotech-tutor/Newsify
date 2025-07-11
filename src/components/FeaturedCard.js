import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, interpolate, Extrapolate } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const FeaturedCard = ({ article, onPress, scrollY }) => {
  const { colors } = useTheme();

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, 300],
      [0, -50],
      Extrapolate.CLAMP
    );

    const scale = interpolate(
      scrollY.value,
      [0, 300],
      [1, 1.1],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY }, { scale }],
    };
  });

  const overlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 200],
      [0.3, 0.7],
      Extrapolate.CLAMP
    );

    return {
      opacity,
    };
  });

  if (!article) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Animated.View style={[styles.imageContainer, animatedStyle]}>
        {article.urlToImage ? (
          <Image
            source={{ uri: article.urlToImage }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: colors.surface }]} />
        )}
        
        <Animated.View style={[styles.overlay, overlayStyle]} />
        
        <View style={styles.contentOverlay}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>FEATURED</Text>
          </View>
          
          <Text style={styles.title} numberOfLines={3}>
            {article.title}
          </Text>
          
          {article.description && (
            <Text style={styles.description} numberOfLines={2}>
              {article.description}
            </Text>
          )}
          
          <View style={styles.footer}>
            <Text style={styles.source}>
              {article.source?.name || 'Unknown Source'}
            </Text>
            <Text style={styles.date}>
              {formatDate(article.publishedAt)}
            </Text>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  contentOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 40,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
  },
  badge: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 26,
    marginBottom: 8,
  },
  description: {
    color: '#e0e0e0',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  source: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  date: {
    color: '#ccc',
    fontSize: 11,
  },
});

export default FeaturedCard;

