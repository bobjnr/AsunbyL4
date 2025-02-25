import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, useWindowDimensions, Image, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from './auth/authContext';

const OnboardingScreen = () => {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList<any>>(null);

  const asunbar2 = require('../assets/images/asunbar2.jpeg');
  const asun2 = require('../assets/images/asun2.jpg');
  const asuntrays = require('../assets/images/asuntrays.jpg');


  const onboardingData = [
    {
      id: '1',
      title: 'Welcome to AsunExpress',
      description: 'Experience the best grilled Asun delivered right to your doorstep',
      image: asunbar2
    },
    {
      id: '2',
      title: 'Fresh & Delicious',
      description: 'Our Asun is prepared fresh daily with premium quality meat and spices',
      image: asun2
    },
    {
      id: '3',
      title: 'Fast Delivery',
      description: 'Quick and reliable delivery to satisfy your Asun cravings',
      image: asuntrays
    }
  ];
  

  const viewableItemsChanged = useRef(({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
    setCurrentIndex(viewableItems[0]?.index ?? 0);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = (index) => {
    slidesRef.current?.scrollToIndex({ index });
  };

  const handleContinueAsGuest = () => {
    router.replace('/');
  };

  const handleGetStarted = () => {
    router.replace('/auth/signup');
  };

  return (
    <View style={styles.container}>
      <View style={styles.slidesContainer}>
      <FlatList
        data={onboardingData}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Image
              source={item.image}
              style={styles.image}
            />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
      />
      </View>
      <View style={styles.pagination}>
        {onboardingData.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 16, 8],
            extrapolate: 'clamp'
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp'
          });

          return (
            <Animated.View
              key={i}
              style={[styles.dot, { width: dotWidth, opacity }]}
            />
          );
        })}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleGetStarted}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={handleContinueAsGuest}
        >
          <Text style={styles.secondaryButtonText}>Continue as Guest</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  slidesContainer: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    width: '80%',
    height: '50%',
    borderRadius: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B0000',
    marginHorizontal: 4,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  button: {
    backgroundColor: '#8B0000',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8B0000',
  },
  secondaryButtonText: {
    color: '#8B0000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;