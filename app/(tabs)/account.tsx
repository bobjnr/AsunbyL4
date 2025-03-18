import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import { useCart } from '../menu/cartcontext';
import { useAuth } from '../auth/authContext';
import { Alert } from 'react-native';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

export default function AccountScreen() {
  const [activeTab, setActiveTab] = useState('person');
  const router = useRouter();
  const pathname = usePathname();
  const { getCartCount } = useCart();
  const [isEditing, setIsEditing] = useState(false);
  const { user, logout, updateUserData } = useAuth();
  const [userInfo, setUserInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    defaultAddress: user?.defaultAddress || ''
  });

  useEffect(() => {
    if (!user) {
      router.replace('/auth/login');
    }
  }, [user]);

  useEffect(() => {
    if (pathname === '/account') {
      setActiveTab('person');
    }
  }, [pathname]);

  useEffect(() => {
    if (user) {
      setUserInfo({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        defaultAddress: user.defaultAddress || '',
      });
    }
  }, [user]);

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

  const handleSignOut = async () => {
    try {
      await logout(); 
      router.replace('/'); 
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out. Please try again.');
      console.error('Logout error:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    try {
      await updateUserData({
        name: userInfo.name,
        phone: userInfo.phone,
        defaultAddress: userInfo.defaultAddress,
      });

      setIsEditing(false);
      
      Alert.alert(
        'Success',
        'Account information successfully updated.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert(
        'Error',
        'Failed to update account information. Please try again.'
      );
    }
  };

  const accountSections = [
    {
      title: 'Orders',
      icon: 'receipt-outline',
      onPress: () => router.push({ pathname: '/order' })
    },
    {
      title: 'Payment Methods',
      icon: 'card-outline',
      onPress: () => router.push({ pathname: '/payments' })
    },
    {
      title: 'Addresses',
      icon: 'location-outline',
      onPress: () => router.push({ pathname: '/addresses' })
    },
    {
      title: 'Notifications',
      icon: 'notifications-outline',
      onPress: () => router.push({ pathname: '/notifications' })
    }
  ];


  return (
    <SafeAreaView style={styles.container}>
      {user ? (
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              Welcome, {user?.name?.split(' ')[0] || 'Guest'}!
            </Text>
            <View style={styles.headerButtons}>
              {isEditing && (
                <TouchableOpacity 
                  style={[styles.editButton, styles.cancelButton]}
                  onPress={() => {
                    setIsEditing(false);
                    setUserInfo({
                      name: user?.name || '',
                      email: user?.email || '',
                      phone: user?.phone || '',
                      defaultAddress: user?.defaultAddress || ''
                    });
                  }}
                >
                  <Ionicons name="close-outline" size={24} color="white" />
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => {
                  if (isEditing) {
                    handleUpdateProfile();
                  } else {
                    setIsEditing(true);
                  }
                }}
              >
                <Ionicons 
                  name={isEditing ? "checkmark-outline" : "create-outline"} 
                  size={24} 
                  color="white" 
                />
              </TouchableOpacity>
            </View>
          </View>

      <ScrollView style={styles.content}>
        {/* Profile Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          <View style={styles.profileInfo}>
            {isEditing ? (
              <>
                 <TextInput
                  style={styles.input}
                  value={userInfo.name}
                  onChangeText={(text) => setUserInfo({...userInfo, name: text})}
                  placeholder="Full Name"
                  autoCapitalize="words"
                />
                <TextInput
                  style={styles.input}
                  value={userInfo.email}
                  onChangeText={(text) => setUserInfo({...userInfo, email: text})}
                  placeholder="Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={false} // Email should not be editable for security
                />
                <TextInput
                  style={styles.input}
                  value={userInfo.phone}
                  onChangeText={(text) => setUserInfo({...userInfo, phone: text})}
                  placeholder="Phone Number"
                  keyboardType="phone-pad"
                />
                <TextInput
                  style={[styles.input, styles.addressInput]}
                  value={userInfo.defaultAddress}
                  onChangeText={(text) => setUserInfo({...userInfo, defaultAddress: text})}
                  placeholder="Default Address"
                  multiline
                />
              </>
            ) : (
              <>
                <View style={styles.infoRow}>
                  <Ionicons name="person-outline" size={20} color="#666" />
                  <Text style={styles.infoText}>{userInfo.name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="mail-outline" size={20} color="#666" />
                  <Text style={styles.infoText}>{userInfo.email}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={20} color="#666" />
                  <Text style={styles.infoText}>{userInfo.phone}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={20} color="#666" />
                  <Text style={styles.infoText}>{userInfo.defaultAddress}</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          {accountSections.map((section, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionButton}
              onPress={section.onPress}
            >
              <View style={styles.actionContent}>
                <Ionicons name={section.icon} size={24} color="#8B0000" />
                <Text style={styles.actionText}>{section.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.supportButton}>
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity 
          style={styles.signOutButton}
          onPress={handleSignOut} // Add this onPress handler
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
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
        </>
      ) : (
        null
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#8B0000',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelButton: {
    marginRight: 10,
  },
  editButton: {
    padding: 8,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  profileInfo: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  addressInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
  },
  supportButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#8B0000',
  },
  supportButtonText: {
    color: '#8B0000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signOutButton: {
    backgroundColor: '#8B0000',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },
  signOutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
});


