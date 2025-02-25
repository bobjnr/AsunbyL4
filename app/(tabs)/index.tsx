import React from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, SafeAreaView, TextInput, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, usePathname, useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '../menu/cartcontext';
import { user } from '../auth/types';
import { useAuth } from '../auth/authContext';

export default function HomeScreen() {
  const images = [
    require('../../assets/images/asun1.jpg'),
    require('../../assets/images/asunplatter.jpeg'),
    require('../../assets/images/asun2.jpg'),
    require('../../assets/images/asuntrays.jpg'),
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('home');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const successMessageAnim = useRef(new Animated.Value(-100)).current;
  
  const router = useRouter();
  const pathname = usePathname();
  const { getCartCount } = useCart();
  const { user } = useAuth();

  // Function to handle sliding images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    if (pathname === '/') {
      setActiveTab('home');
    }
  }, [pathname]);

  const navigationItems = [
    { name: "home", label: "Home", icon: "home", route: "/" },
    { name: "pricetag", label: "Offer", icon: "pricetag", route: "/offers" },
    { name: "restaurant", label: "Order", icon: "restaurant", route: "/menu" },
    { name: "cart", label: "Cart", icon: "cart", route: "/menu/cart" },
    { 
      name: "person", 
      label: user ? 'Account' : 'Sign In', 
      icon: "person", 
      route: user ? '/account' : '/auth/login'
    },
  ];

  const handleNavigation = (route, tabName) => {
    setActiveTab(tabName);
    router.push(route);
  };


  return (
    <SafeAreaView style={styles.container}>
      {showSuccessMessage && (
        <Animated.View 
          style={[
            styles.successMessage,
            {
              transform: [{ translateY: successMessageAnim }],
            },
          ]}
        >
          <Text style={styles.successMessageText}>Login Successful!</Text>
        </Animated.View>
      )}
      <ScrollView>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/logo.png')} // Replace with your logo image path
            style={styles.logoImage}
          />
        </View>

          {/* Explore Banner */}
          <View style={styles.exploreSection}>
          <Text style={styles.exploreTitle}>Explore Our Delicacies</Text>
          <Image
            source={images[currentImageIndex]}
            style={styles.exploreImageFull}
          />
        </View>

        {/* Promo Banner */}
        <View style={styles.bannerContainer}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Get Premium ASUN!</Text>
            <Text style={styles.bannerSubtitle}>
              Order deliciously grilled Asun on a round grill platform at an affordable price
            </Text>
            <Link href="/menu" asChild>
              <TouchableOpacity style={styles.orderButton}>
                <Text style={styles.orderButtonText}>Order now</Text>
              </TouchableOpacity>
            </Link>
          </View>
          <Image
            source={require('../../assets/images/asunlabel1.jpg')}
            style={styles.bannerImage}
          />
        </View>

        {/* Categories Section
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          {["Explore"].map((category, index) => (
            <TouchableOpacity key={index} style={styles.categoryButton}>
              <Text style={styles.categoryText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView> */}

         {/* Featured Section */}
         <View style={styles.featuredSection}>
          <Text style={styles.featuredTitle}>Featured Asun Special!</Text>

          {/* Asunbar Product */}
          <View style={styles.featuredCardCentered}>
            <Image
              source={require('../../assets/images/asunbar.png')}
              style={styles.featuredImage}
            />
            <Text style={styles.featuredCardTitle}>Asunbar</Text>
          </View>

          {/* Additional Product */}
          <View style={styles.featuredCardCentered}>
            <Image
              source={require('../../assets/images/asun2.jpg')}
              style={styles.featuredImage}
            />
            <Text style={styles.featuredCardTitle}>Medium Tray</Text>
          </View>

          {/* See More Button */}
          <Link href="/menu" asChild>
            <TouchableOpacity style={styles.seeMoreButton}>
              <Text style={styles.seeMoreButtonText}>See More</Text>
            </TouchableOpacity>
          </Link>
        </View>

       {/* Privacy Section */}
       <View style={styles.privacySection}>
          <TouchableOpacity style={styles.privacyButton}>
            <Text style={styles.privacyButtonText}>View Our Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={styles.privacyText}>Your data and privacy are important to us.</Text>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {navigationItems.map((item) => (
          <TouchableOpacity 
            key={item.name}
            style={[
              styles.navItem,
              item.name === 'restaurant' && styles.orderNavItem
            ]}
            onPress={() => handleNavigation(item.route, item.name)}
          >
            <Ionicons 
              name={item.icon as keyof typeof Ionicons.glyphMap} 
              size={24} 
              color={item.name === 'restaurant' ? '#fff' : 
                     item.name === activeTab ? '#8B0000' : 'gray'} 
            />
            {item.name === 'cart' && getCartCount() > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {getCartCount()}
                  </Text>
                </View>
              )}
            {item.name === 'cart' && getCartCount() > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {getCartCount()}
                </Text>
              </View>
            )}
            <Text 
              style={[
                styles.navText,
                item.name === 'restaurant' ? styles.orderNavText :
                item.name === activeTab && styles.activeNavText,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 0,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  logoContainer: {
    alignItems: 'center',
    //marginVertical: 0,
    backgroundColor: '#8B0000',
  },
  logoImage: {
    width: 200,
    height: 100,
    marginTop: 20,
    resizeMode: 'contain',
  },
  exploreSection: {
    marginTop: 0,
    padding: 15,
    alignItems: 'center',
  },
  exploreTitle: {
    marginTop: 0,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  exploreImageFull: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  // locationRow: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  // },
  // locationText: {
  //   marginLeft: 5,
  //   fontSize: 14,
  //   color: 'black',
  // },
  // searchBarContainer: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   backgroundColor: '#f0f0f0',
  //   margin: 15,
  //   padding: 10,
  //   borderRadius: 10,
  // },
  // searchInput: {
  //   marginLeft: 10,
  //   fontSize: 14,
  //   flex: 1,
  // },
  bannerContainer: {
    backgroundColor: '#fff8f0',
    margin: 15,
    borderRadius: 10,
    flexDirection: 'row',
    overflow: 'hidden',
    marginTop: 10,
  },
  bannerContent: {
    flex: 1,
    padding: 15,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  bannerSubtitle: {
    fontSize: 14,
    color: 'gray',
    marginVertical: 10,
  },
  orderButton: {
    backgroundColor: '#8B0000',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  orderButtonText: {
    color: 'white',
    fontSize: 14,
  },
  bannerImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  categoryButton: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryText: {
    fontSize: 14,
    color: 'black',
  },
  featuredSection: {
    //backgroundColor: '#8B0000',
    padding: 15,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    //color: 'white',
  },
  featuredCardCentered: {
    alignItems: 'center',
    marginBottom: 20,
  },
  featuredImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
  },
  featuredCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  seeMoreButton: {
    backgroundColor: '#8B0000',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'center',
  },
  seeMoreButtonText: {
    color: 'white',
    fontSize: 14,
  },
  privacySection: {
    backgroundColor: '#fff8f0',
    padding: 20,
    alignItems: 'center',
  },
  privacyButton: {
    borderColor: '#8B0000',
    borderWidth: 2,
    borderRadius: 25,
    padding: 15,
    width: '100%',
    marginBottom: 10,
  },
  privacyButtonText: {
    color: 'black',
    textAlign: 'center',
    fontSize: 16,
  },
  privacyText: {
    color: 'black',
    textAlign: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  navItem: {
    alignItems: 'center',
    padding: 5,
    borderRadius: 8,
  },
  orderNavItem: {
    backgroundColor: '#8B0000',
    padding: 8,
    borderRadius: 12,
    marginTop: -15,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  navText: {
    fontSize: 12,
    color: 'gray',
    marginTop: 5,
  },
  activeNavText: {
    color: '#8B0000',
    fontWeight: 'bold',
  },
  orderNavText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  badge: {
    position: 'absolute',
    right: -8,
    top: -8,
    backgroundColor: '#8B0000',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 4,
  },
  successMessage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    padding: 15,
    zIndex: 999,
    alignItems: 'center',
  },
  successMessageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});


