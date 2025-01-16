// import { useEffect } from 'react';
// import { View, Image, StyleSheet, Animated } from 'react-native';
// import { router } from 'expo-router';

// export default function SplashScreen() {
//   // Create an animated value for opacity
//   const fadeAnim = new Animated.Value(0);
//   const scaleAnim = new Animated.Value(0.8);

//   useEffect(() => {
//     // Start the animations when component mounts
//     Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 1000,
//         useNativeDriver: true,
//       }),
//       Animated.spring(scaleAnim, {
//         toValue: 1,
//         tension: 20,
//         friction: 7,
//         useNativeDriver: true,
//       })
//     ]).start();

//     // Navigate to main screen after delay
//     const timer = setTimeout(() => {
//       router.replace('./index');  // Replace with your main screen route
//     }, 3000);

//     return () => clearTimeout(timer);
//   }, []);

//   return (
//     <View style={styles.container}>
//       <Animated.View
//         style={[
//           styles.logoContainer,
//           {
//             opacity: fadeAnim,
//             transform: [{ scale: scaleAnim }]
//           }
//         ]}
//       >
//         <Image
//           source={require('../assets/images/logo.png')}  // Replace with your logo path
//           style={styles.logo}
//           resizeMode="contain"
//         />
//       </Animated.View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#8B0000', // Matching your app's theme color
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   logoContainer: {
//     width: 200,
//     height: 200,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   logo: {
//     width: '100%',
//     height: '100%',
//   },
// });