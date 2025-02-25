import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from './authContext';
import { useRouter, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FirebaseError } from 'firebase/app';

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { resetPassword } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await resetPassword(email);
      setSuccess(true);
      setEmail(''); // Clear the email field
    } catch (error) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/user-not-found':
            setError('No account found with this email address.');
            break;
          case 'auth/invalid-email':
            setError('Invalid email address.');
            break;
          default:
            setError('Failed to send reset email. Please try again.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (segments.length > 1) {
      router.back();
    } else {
      router.replace('/auth/login');
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

      <Text style={styles.title}>Reset Password</Text>
      
      {success ? (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>
            Password reset email sent! Please check your inbox and follow the instructions.
          </Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.replace('/auth/login')}
          >
            <Text style={styles.buttonText}>Return to Login</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.instructions}>
            Enter your email address and we'll send you instructions to reset your password.
          </Text>
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            placeholder="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />
          
          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Sending...' : 'Reset Password'}
            </Text>
          </TouchableOpacity>
        </>
      )}
      
      <TouchableOpacity onPress={() => router.push('/auth/login')}>
        <Text style={styles.linkText}>Back to Login</Text>
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
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#8B0000',
  },
  instructions: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 5,
  },
  inputError: {
    borderColor: '#ff0000',
  },
  errorText: {
    color: '#ff0000',
    marginBottom: 15,
    textAlign: 'center',
  },
  successContainer: {
    alignItems: 'center',
  },
  successText: {
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#8B0000',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
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
});