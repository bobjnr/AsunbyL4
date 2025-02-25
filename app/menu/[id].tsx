import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useCart } from '../menu/cartcontext';
import Toast from 'react-native-toast-message';

const productDetails = {
  mini: {
    name: 'Mini Tray',
    price: '$20.00',
    serves: 'Serves 1-2',
    image: require('../../assets/images/minitray.jpeg'),
    description: 'Perfect for a personal treat. Our Mini Tray offers the same authentic Nigerian Asun experience in a perfectly portioned size. Each piece is carefully grilled and seasoned with our signature spice blend, ensuring maximum flavor in every bite.',
  },
  small: {
    name: 'Small Tray',
    price: '$50.00',
    serves: 'Serves 2-5',
    image: require('../../assets/images/smalltray.jpeg'),
    description: 'Ideal for sharing. The Small Tray is perfect for intimate gatherings or family meals. Featuring our premium cuts of goat meat, expertly grilled and seasoned to perfection. Each piece is tender, flavorful, and carries our signature spicy kick.',
  },
  medium: {
    name: 'Medium Tray',
    price: '$100.00',
    serves: 'Serves 10-15',
    image: require('../../assets/images/mediumtray.jpeg'),
    description: 'Ideal for family dinners. Our Medium Tray brings the authentic taste of Nigerian Asun to your family gathering. Generously portioned and perfectly spiced, this selection features premium cuts of goat meat, slow-grilled to achieve that perfect balance of tenderness and flavor.',
  },
  large: {
    name: 'Large Tray',
    price: '$280.00',
    serves: 'Serves 35-40',
    image: require('../../assets/images/largetray.jpeg'),
    description: 'Great for gatherings and celebrations. The Large Tray is designed for those special occasions that call for something extraordinary. Each piece is marinated in our special blend of spices, grilled to perfection, and garnished with fresh peppers and onions.',
  },
  party: {
    name: 'Party Tray',
    price: '$780.00',
    serves: 'Serves 100',
    description: 'The ultimate choice for events and parties. Our Party Tray is the showstopper at any large gathering. Perfect for weddings, corporate events, or large celebrations. Each tray is prepared with the utmost care, featuring our signature spicy grilled goat meat, expertly seasoned and garnished. We ensure consistent quality and flavor across every piece, making it the perfect choice for impressing your guests.',
    image: require('../../assets/images/partytray.jpeg'),
  },
};

export default function Details() {
    const { id } = useLocalSearchParams();
    const [quantity, setQuantity] = useState(1);
    const product = productDetails[id];
    const { addToCart } = useCart();
    const { getCartCount } = useCart();
  
    const handleAddToCart = () => {
      addToCart({
        id: id as string,
        name: product.name,
        price: parseFloat(product.price.slice(1)),
        quantity,
        image: product.image,
      });
      Toast.show({
        type: 'success',
        text1: 'Cart successfully updated',
        position: 'top',
        visibilityTime: 2000,
      });
    };
  
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Details</Text>
          <TouchableOpacity 
            style={styles.cartButton}
            onPress={() => router.push('/menu/cart')}
          >
            <Ionicons name="cart" size={24} color="white" />
            {getCartCount() > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{getCartCount()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <ScrollView>
          <Image source={product.image} style={styles.productImage} />

          <View style={styles.contentContainer}>
            <Text style={styles.title}>{product.name}</Text>
            <Text style={styles.serves}>{product.serves}</Text>
            <Text style={styles.price}>{product.price}</Text>
            
            <Text style={styles.description}>{product.description}</Text>

            <View style={styles.quantityContainer}>
              <TouchableOpacity 
                style={styles.quantityButton} 
                onPress={() => quantity > 1 && setQuantity(q => q - 1)}
              >
                <Ionicons name="remove" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.quantity}>{quantity}</Text>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => setQuantity(q => q + 1)}
              >
                <Ionicons name="add" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
              <Text style={styles.addToCartText}>Add to Cart - {`$${(parseFloat(product.price.slice(1)) * quantity).toFixed(2)}`}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: '#8B0000',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  cartButton: {
    padding: 8,
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -6,
    backgroundColor: '#FF4500',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 6,
  },
  backButton: {
    padding: 8,
  },
  productImage: {
    width: '100%',
    height: 300,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 8,
  },
  serves: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    marginBottom: 30,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  quantityButton: {
    backgroundColor: '#8B0000',
    borderRadius: 20,
    padding: 8,
  },
  quantity: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 20,
  },
  addToCartButton: {
    backgroundColor: '#8B0000',
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  addToCartText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});