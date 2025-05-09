import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Alert, Image } from 'react-native';
import { useAuth } from './authContext';
import { useRouter, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { signInWithPopup } from 'firebase/auth';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const { signup, googleSignIn } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBack = () => {
    if (segments.length > 1) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const handleSignup = async () => {
    if (!email || !password || !name) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Basic password validation
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    const formData = { email, password, name };
    try {
      await signup(formData);
      Alert.alert(
        'Verify Your Email',
        'Please check your email and click the verification link to complete your registration.',
        [{ 
          text: 'OK', 
          onPress: () => {
            router.replace('/auth/login');
          }
        }]
      );
    } catch (error) {
      Alert.alert('Signup Error', error.message || 'An error occurred during signup.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      await googleSignIn();
      router.replace('/');
    } catch (error) {
      console.error('Google signup error:', error);
      setError('Failed to sign up with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={handleBack}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={24} color="#8B0000" />
      </TouchableOpacity>
      <Text style={styles.title}>Create Account</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#999"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, styles.passwordInput]}
          placeholder="Password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity 
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons 
            name={showPassword ? "eye-off" : "eye"} 
            size={24} 
            color="#8B0000" 
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleSignup}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Creating Account...' : 'Sign Up'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.googleButton, loading && styles.buttonDisabled]} 
        onPress={handleGoogleSignup}
        disabled={loading}
      >
        <View style={styles.googleButtonContent}>
          <Image 
            source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }} 
            style={styles.googleIcon} 
          />
          <Text style={styles.googleButtonText}>
            {loading ? 'Signing up...' : 'Sign up with Google'}
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/auth/login')}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#8B0000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 5,
    color: '#000',
  },
  button: {
    backgroundColor: '#8B0000',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#8B0000',
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  passwordInput: {
    marginBottom: 0,
    paddingRight: 50, 
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 5,
  },
  googleButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  googleButtonText: {
    color: '#757575',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff0000',
    marginBottom: 15,
    textAlign: 'center',
  },
});