import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import LottieView from 'lottie-react-native';

const OnboardingScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <LottieView
        source={require('../../assets/animations/onboarding.json')} // Placeholder for Lottie animation
        autoPlay
        loop
        style={styles.animation}
      />
      <Text style={styles.title}>Welcome to Newsify!</Text>
      <Text style={styles.subtitle}>Your daily dose of news.</Text>
      <Button title="Get Started" onPress={() => navigation.replace('Login')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  animation: {
    width: 200,
    height: 200,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
});

export default OnboardingScreen;

