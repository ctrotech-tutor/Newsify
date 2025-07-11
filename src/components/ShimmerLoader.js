import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const ShimmerLoader = ({ width: customWidth, height, borderRadius = 8, style }) => {
  const shimmerTranslateX = useSharedValue(-width);

  useEffect(() => {
    shimmerTranslateX.value = withRepeat(
      withTiming(width, { duration: 1000 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shimmerTranslateX.value }],
    };
  });

  return (
    <View
      style={[
        styles.container,
        {
          width: customWidth || width - 40,
          height: height || 20,
          borderRadius,
        },
        style,
      ]}
    >
      <Animated.View style={[styles.shimmer, animatedStyle]} />
    </View>
  );
};

const ShimmerCard = () => (
  <View style={styles.card}>
    <ShimmerLoader height={200} style={{ marginBottom: 10 }} />
    <ShimmerLoader height={20} width={250} style={{ marginBottom: 8 }} />
    <ShimmerLoader height={16} width={200} style={{ marginBottom: 8 }} />
    <ShimmerLoader height={14} width={100} />
  </View>
);

const ShimmerFeaturedCard = () => (
  <View style={styles.featuredCard}>
    <ShimmerLoader height={250} style={{ marginBottom: 15 }} />
    <ShimmerLoader height={24} width={300} style={{ marginBottom: 10 }} />
    <ShimmerLoader height={18} width={250} style={{ marginBottom: 8 }} />
    <ShimmerLoader height={16} width={150} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E1E9EE',
    overflow: 'hidden',
  },
  shimmer: {
    width: '30%',
    height: '100%',
    backgroundColor: '#F7F8F8',
    opacity: 0.5,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuredCard: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 10,
    marginVertical: 10,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
});

export { ShimmerLoader, ShimmerCard, ShimmerFeaturedCard };

