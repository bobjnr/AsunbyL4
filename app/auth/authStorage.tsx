import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from './types';

const AUTH_KEY = 'auth_user';

export const authStorage = {
  async storeUser(userData: User) {
    try {
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Error storing auth data:', error);
      throw error;
    }
  },

  async getUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(AUTH_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting auth data:', error);
      return null;
    }
  },

  async removeUser() {
    try {
      await AsyncStorage.removeItem(AUTH_KEY);
    } catch (error) {
      console.error('Error removing auth data:', error);
      throw error;
    }
  }
};