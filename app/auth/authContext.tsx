import React, { createContext, useState, useContext, useEffect } from 'react';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
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
import { getFirestore, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { ActivityIndicator, Modal, View, Text, StyleSheet } from 'react-native';

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

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  // Initialize Google Sign In
  useEffect(() => {
    GoogleSignin.configure({
      scopes: ['email', 'profile'],
      webClientId: '1034262411934-p4p9lfgvqp6e04g370eefj0ped3g68op.apps.googleusercontent.com',
      iosClientId: '1034262411934-kff7pgcm9naglmctonjvh6lqjjfufeef.apps.googleusercontent.com',
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setLoadingMessage('Loading your profile...');
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
      setLoadingMessage('');
    });
  
    return () => unsubscribe();
  }, []);

  // Function to handle Google credential
  const handleGoogleCredential = async (idToken: string) => {
    try {
      setLoadingMessage('Verifying your Google account...');
      // Create a Google credential with the token
      const credential = GoogleAuthProvider.credential(idToken);
      
      // Sign in with credential from the Google user
      setLoadingMessage('Signing you in...');
      const userCredential = await signInWithCredential(auth, credential);
      const { user: firebaseUser } = userCredential;
      
      // Check if user document exists
      setLoadingMessage('Retrieving your information...');
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      let userData;
      
      if (!userDoc.exists()) {
        // Create user document if first time sign in
        setLoadingMessage('Setting up your account...');
        userData = {
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          emailVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      } else {
        // Get existing user data
        userData = userDoc.data();
        // Update last login time
        await updateDoc(doc(db, 'users', firebaseUser.uid), {
          lastLoginAt: new Date().toISOString()
        });
      }
      
      // Set user in state and storage
      const fullUserData = {
        uid: firebaseUser.uid,
        ...userData,
        emailVerified: true
      };
      
      await authStorage.storeUser(fullUserData);
      setUser(fullUserData);
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Logged in with Google successfully',
        position: 'bottom'
      });
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
      setLoadingMessage('');
    }
  };

  const signup = async (userData: SignupData) => {
    try {
      setLoadingMessage('Creating your account...');
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      await updateProfile(userCredential.user, { displayName: userData.name });
      
      // Send verification email
      setLoadingMessage('Sending verification email...');
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
    } finally {
      setLoadingMessage('');
    }
  };

  const login = async (credentials: AuthCredentials) => {
    try {
      setLoadingMessage('Logging you in...');
      const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      
      // Reload the user to get the latest emailVerified status
      await reload(userCredential.user);
      
      if (!userCredential.user.emailVerified) {
        // If email is not verified, send a new verification email
        setLoadingMessage('Sending verification email...');
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
    } finally {
      setLoadingMessage('');
    }
  };

  const resendVerificationEmail = async () => {
    try {
      setLoadingMessage('Sending verification email...');
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
    } finally {
      setLoadingMessage('');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoadingMessage('Sending password reset email...');
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
    } finally {
      setLoadingMessage('');
    }
  };

  const continueAsGuest = async () => {
    try {
      setLoadingMessage('Setting up guest account...');
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
    } finally {
      setLoadingMessage('');
    }
  };

  const updateUserData = async (userData: Partial<User>) => {
    if (!user?.uid) return;

    try {
      setLoadingMessage('Updating your profile...');
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
    } finally {
      setLoadingMessage('');
    }
  };

  const logout = async () => {
    try {
      setLoadingMessage('Signing you out...');
      // Sign out from Google
      await GoogleSignin.signOut();
      // Sign out from Firebase
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
    } finally {
      setLoadingMessage('');
    }
  };

  const googleSignIn = async () => {
    try {
      setIsLoading(true);
      setLoadingMessage('Preparing Google sign-in...');
      console.log('Initiating Google sign-in');

      // Check if Play Services are available
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      console.log('Play Services check passed');

      // Force sign out before proceeding
      setLoadingMessage('Authenticating with Google...');
      await GoogleSignin.signOut();

      // Perform Google sign-in
      const userInfo = await GoogleSignin.signIn();
      console.log('Sign-in response:', JSON.stringify(userInfo, null, 2));

      // Extract idToken from the correct location in the response
      const idToken = userInfo?.data?.idToken;

      if (!idToken) {
        throw new Error('No ID token received from Google Sign-In');
      }

      // Handle the Google credential
      await handleGoogleCredential(idToken);
      
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Toast.show({
          type: 'info',
          text1: 'Sign-in Cancelled',
          text2: 'Google sign-in was cancelled',
          position: 'bottom'
        });
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Toast.show({
          type: 'info',
          text1: 'In Progress',
          text2: 'Sign-in already in progress',
          position: 'bottom'
        });
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Play Services not available',
          position: 'bottom'
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message || 'Failed to login with Google. Please try again.',
          position: 'bottom'
        });
      }
      throw error;
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // Loading Modal component
  const LoadingModal = () => (
    <Modal
      transparent={true}
      visible={!!loadingMessage}
      animationType="fade"
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <ActivityIndicator size="large" color="#8B0000" />
          <Text style={styles.loadingText}>{loadingMessage}</Text>
        </View>
      </View>
    </Modal>
  );

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      signup, 
      logout,
      continueAsGuest,
      updateUserData,
      resendVerificationEmail,
      resetPassword,
      googleSignIn
    }}>
      <LoadingModal />
      {children}
    </AuthContext.Provider>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    minWidth: 250,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  }
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};