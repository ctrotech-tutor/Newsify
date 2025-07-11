import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    setTimeout(() => {
      // Replace with your logic to check auth status or onboarding completion
      navigation.replace('Onboarding'); // or 'Login' or 'Home'
    }, 3000); // 3 seconds
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/splash.png")}
        style={styles.logo}
      />
      <Text style={styles.title}>Newsify</Text>
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
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 20,
  },
});

export default SplashScreen;

