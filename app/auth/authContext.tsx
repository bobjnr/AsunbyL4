import React, { createContext, useState, useContext, useEffect } from 'react';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { AuthContextType, User, AuthCredentials, SignupData } from './types';
import { authStorage } from './authStorage';
import { initializeApp } from 'firebase/app';
import Toast from 'react-native-toast-message';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
  updateProfile,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  reload
} from 'firebase/auth';
import { getFirestore, doc, updateDoc, setDoc, getDoc, DocumentData, DocumentReference } from 'firebase/firestore';

// Initialize Firebase - Replace with your config
const firebaseConfig = {
  apiKey: "AIzaSyDXEJfAcsLPU6m25X7Z-syRJ8bP4q-xw3g",
  authDomain: "asunbyl4-fb95d.firebaseapp.com",
  projectId: "asunbyl4-fb95d",
  storageBucket: "asunbyl4-fb95d.firebasestorage.app",
  messagingSenderId: "1034262411934",
  appId: "1:1034262411934:web:f1fa62981546aca22fd98f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

GoogleSignin.configure({
  webClientId: '1034262411934-p4p9lfgvqp6e04g370eefj0ped3g68op.apps.googleusercontent.com',
});

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Reload the user to get the latest emailVerified status
          await reload(firebaseUser);
          
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const userData = userDoc.data() as Omit<User, 'uid'>;
          
          // Update the emailVerified status in Firestore
          if (userData && firebaseUser.emailVerified !== userData.emailVerified) {
            await updateDoc(doc(db, 'users', firebaseUser.uid), {
              emailVerified: firebaseUser.emailVerified
            });
          }
  
          const fullUserData: User = {
            uid: firebaseUser.uid,
            ...userData,
            emailVerified: firebaseUser.emailVerified,
          };
  
          await authStorage.storeUser(fullUserData);
          setUser(fullUserData);
        } else {
          setUser(null);
          await authStorage.removeUser();
        }
      } catch (error) {
        console.error('Auth state error:', error);
      }
      setIsLoading(false);
    });
  
    return () => unsubscribe();
  }, []);

  interface SignupData {
    email: string;
    password: string;
    name: string;
    phone?: string;
    address?: string;
  }

  const signup = async (userData: SignupData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      await updateProfile(userCredential.user, { displayName: userData.name });
      
      // Send verification email
      await sendEmailVerification(userCredential.user);
      
      const userDoc = {
        email: userData.email,
        name: userData.name,
        phone: userData.phone || '',
        defaultAddress: userData.address || '',
        emailVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userDoc);

      const fullUserData = { 
        uid: userCredential.user.uid, 
        ...userDoc 
      };
      
      await authStorage.storeUser(fullUserData);
      setUser(fullUserData);

      Toast.show({
        type: 'success',
        text1: 'Verification Email Sent',
        text2: 'Please check your email to verify your account',
        position: 'bottom'
      });
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const login = async (credentials: AuthCredentials) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      
      // Reload the user to get the latest emailVerified status
      await reload(userCredential.user);
      
      if (!userCredential.user.emailVerified) {
        // If email is not verified, send a new verification email
        await sendEmailVerification(userCredential.user);
        throw new Error('Please verify your email address. A new verification email has been sent.');
      }

      // Update the user document with the latest verification status
      await updateDoc(doc(db, 'users', userCredential.user.uid), {
        emailVerified: userCredential.user.emailVerified,
        lastLoginAt: new Date().toISOString()
      });

      return userCredential;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const resendVerificationEmail = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser && !currentUser.emailVerified) {
        await sendEmailVerification(currentUser);
        Toast.show({
          type: 'success',
          text1: 'Verification Email Sent',
          text2: 'Please check your email to verify your account',
          position: 'bottom'
        });
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      Toast.show({
        type: 'success',
        text1: 'Reset Email Sent',
        text2: 'Please check your email to reset your password',
        position: 'bottom'
      });
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };


  const continueAsGuest = async () => {
    try {
      const userCredential = await signInAnonymously(auth);
      
      const guestDoc: Omit<User, 'uid'> = {
        email: '',
        name: 'Guest',
        isGuest: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), guestDoc);
    } catch (error) {
      console.error('Guest login error:', error);
      throw error;
    }
  };

  const updateUserData = async (userData: Partial<User>) => {
    if (!user?.uid) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...userData,
        updatedAt: new Date().toISOString()
      });

      // Update local state
      setUser(prevUser => prevUser ? { ...prevUser, ...userData } : null);
      
      // Update stored user data
      if (user) {
        await authStorage.storeUser({ ...user, ...userData });
      }
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null); 
      await authStorage.removeUser();
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Logged out successfully',
        position: 'bottom'
      });
    } catch (error) {
      console.error('Logout error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to logout. Please try again.',
        position: 'bottom'
      });
      throw error;
    }
  };

  const googleSignIn = async () => {
    try {
      setIsLoading(true);
      
      // For Expo
      if (Platform.OS === 'web') {
        // Web workflow using Firebase directly
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        
        // Handle user data similar to your existing login
        const userDoc = await getDoc(doc(db, 'users', result.user.uid));
        
        if (!userDoc.exists()) {
          // Create user document if first time sign in
          await setDoc(doc(db, 'users', result.user.uid), {
            email: result.user.email,
            name: result.user.displayName,
            emailVerified: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } else {
          // Update last login time
          await updateDoc(doc(db, 'users', result.user.uid), {
            lastLoginAt: new Date().toISOString()
          });
        }
      } else {
        // For native
        await GoogleSignin.hasPlayServices();
        const { idToken } = await GoogleSignin.signIn();
        
        // Create a Google credential with the token
        const credential = GoogleAuthProvider.credential(idToken);
        
        // Sign in with credential from the Google user
        const userCredential = await signInWithCredential(auth, credential);
        const { user: firebaseUser } = userCredential;
        
        // Check if user document exists
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        
        if (!userDoc.exists()) {
          // Create user document if first time sign in
          const userData = {
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            emailVerified: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          await setDoc(doc(db, 'users', firebaseUser.uid), userData);
        } else {
          // Update last login time
          await updateDoc(doc(db, 'users', firebaseUser.uid), {
            lastLoginAt: new Date().toISOString()
          });
        }
        
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Logged in with Google successfully',
          position: 'bottom'
        });
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to login with Google. Please try again.',
        position: 'bottom'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      signup, 
      logout,
      continueAsGuest ,
      updateUserData,
      resendVerificationEmail,
      resetPassword,
      googleSignIn
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

