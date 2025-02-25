import React, { useState } from 'react';
import { ZelleTestService, ZELLE_TEST_CASES } from '../services/zelleTestService';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface BankCredentials {
  username: string;
  password: string;
}

const ZellePayment = () => {
  const [step, setStep] = useState<'bank-select' | 'credentials' | 'verification'>('bank-select');
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [credentials, setCredentials] = useState<BankCredentials>({ username: '', password: '' });
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Mock bank list - replace with actual bank partner list
  const banks = [
    { id: 'chase', name: 'Chase' },
    { id: 'bofa', name: 'Bank of America' },
    { id: 'wells', name: 'Wells Fargo' },
    { id: 'citi', name: 'Citibank' }
  ];

  const handleBankSelect = (bankId: string) => {
    setSelectedBank(bankId);
    setStep('credentials');
  };

  const handleCredentialsSubmit = async () => {
    setLoading(true);
    try {
      // Use test service for authentication
      const authResult = await ZelleTestService.authenticate({
        bankId: selectedBank,
        username: credentials.username,
        password: credentials.password
      });

      if (authResult.success) {
        // Send verification code
        await ZelleTestService.sendVerificationCode(credentials.username);
        setStep('verification');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async () => {
    setLoading(true);
    try {
      // Verify code
      const verifyResult = await ZelleTestService.verifyCode(
        credentials.username,
        verificationCode
      );

      if (verifyResult.success) {
        // Process payment
        const paymentResult = await ZelleTestService.processPayment(
          credentials.username,
          100, // Amount from your order
          'recipient@example.com' // Recipient email/phone
        );

        Alert.alert(
          'Success',
          'Payment sent successfully!',
          [{ text: 'OK', onPress: () => router.replace('/menu/orders') }]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const renderBankSelection = () => (
    <View style={styles.content}>
      <Text style={styles.subtitle}>Select your bank to continue</Text>
      {banks.map(bank => (
        <TouchableOpacity
          key={bank.id}
          style={styles.bankOption}
          onPress={() => handleBankSelect(bank.id)}
        >
          <Text style={styles.bankName}>{bank.name}</Text>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderCredentials = () => (
    <View style={styles.content}>
      <Text style={styles.subtitle}>Enter your bank credentials</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={credentials.username}
        onChangeText={(text) => setCredentials(prev => ({ ...prev, username: text }))}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={credentials.password}
        onChangeText={(text) => setCredentials(prev => ({ ...prev, password: text }))}
        secureTextEntry
      />
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleCredentialsSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.submitButtonText}>Continue</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderVerification = () => (
    <View style={styles.content}>
      <Text style={styles.subtitle}>Enter verification code</Text>
      <Text style={styles.description}>
        We've sent a verification code to your registered phone number
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Enter code"
        value={verificationCode}
        onChangeText={setVerificationCode}
        keyboardType="number-pad"
        maxLength={6}
      />
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleVerificationSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.submitButtonText}>Verify & Pay</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            if (step === 'credentials') {
              setStep('bank-select');
            } else if (step === 'verification') {
              setStep('credentials');
            } else {
              router.back();
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Zelle Payment</Text>
        <View style={styles.placeholder} />
      </View>

      {step === 'bank-select' && renderBankSelection()}
      {step === 'credentials' && renderCredentials()}
      {step === 'verification' && renderVerification()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#6B1FF3',
  },
  headerTitle: {
    fontSize: 20,
    marginTop: 30,
    fontWeight: 'bold',
    color: 'white',
  },
  backButton: {
    marginTop: 30,
  },
  placeholder: {
    width: 24,
  },
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  bankOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 10,
  },
  bankName: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#6B1FF3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ZellePayment;