import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { Link, useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useCart } from '../menu/cartcontext';

const menuItems = [
  {
    id: 'mini',
    name: 'Mini Tray',
    price: '$20.00',
    image: require('../../assets/images/minitray.jpeg'),
    description: 'Perfect for personal portions'
  },
  {
    id: 'small',
    name: 'Small Tray',
    price: '$50.00',
    image: require('../../assets/images/smalltray.jpeg'),
    description: 'Great for couples'
  },
  {
    id: 'medium',
    name: 'Medium Tray',
    price: '$100.00',
    image: require('../../assets/images/mediumtray.jpeg'),
    description: 'Ideal for small gatherings'
  },
  {
    id: 'large',
    name: 'Large Tray',
    price: '$280.00',
    image: require('../../assets/images/largetray.jpeg'),
    description: 'Perfect for events'
  },
  {
    id: 'party',
    name: 'Party Tray',
    price: '$780.00',
    image: require('../../assets/images/partytray.jpeg'),
    description: 'Ideal for large celebrations'
  }
];

export default function MenuScreen() {
  const [activeTab, setActiveTab] = useState('restaurant');
  const router = useRouter();
  const pathname = usePathname();
  const { getCartCount } = useCart();

  useEffect(() => {
    if (pathname === '/menu') {
      setActiveTab('restaurant');
    }
  }, [pathname]); 

  const navigationItems = [
    { name: "home", label: "Home", icon: "home", route: "/" },
    { name: "pricetag", label: "Offer", icon: "pricetag", route: "/offers" },
    { name: "restaurant", label: "Order", icon: "restaurant", route: "/menu" },
    { name: "cart", label: "Cart", icon: "cart", route: "/menu/cart" },
    { name: "person", label: "Account", icon: "person", route: "/account" },
  ];

  const handleNavigation = (route, tabName) => {
    setActiveTab(tabName);
    router.push(route);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menu</Text>
      </View>
      
      <ScrollView>
        <View style={styles.menuGrid}>
          {menuItems.map((item) => (
            <Link 
              href={{
                pathname: "/menu/[id]",
                params: { id: item.id }
              }} 
              key={item.id}
              asChild
            >
              <TouchableOpacity style={styles.menuItem}>
                <Image source={item.image} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>{item.price}</Text>
                </View>
              </TouchableOpacity>
            </Link>
          ))}
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
              name={item.icon} 
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 0 : 0,
  },
  header: {
    backgroundColor: '#8B0000',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 30,
  },
  menuGrid: {
    padding: 15,
  },
  menuItem: {
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemImage: {
    width: '100%',
    height: 300,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  itemInfo: {
    padding: 15,
  },
  itemName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  itemPrice: {
    fontSize: 18,
    color: '#333',
    marginTop: 5,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingVertical: 10,
    backgroundColor: 'white',
    paddingBottom: Platform.OS === 'ios' ? 40 : 10,
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
});