import { createContext, useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signInWithPopup,
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { createUserProfile, getUserProfile } from '../services/firestoreService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);       // merged Firebase + Firestore profile
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  // Fetch Firestore profile and merge with Firebase user
  const loadUserProfile = useCallback(async (fbUser) => {
    if (!fbUser) {
      setUser(null);
      setFirebaseUser(null);
      setAuthReady(true);
      return;
    }
    setAuthReady(false);
    setFirebaseUser(fbUser);
    try {
      let profile = await getUserProfile(fbUser.uid);
      if (!profile) {
        // First-time user (e.g. Google sign-in), create a default profile
        const newProfile = {
          name: fbUser.displayName || fbUser.email.split('@')[0],
          email: fbUser.email,
          role: 'student', // default role; admin can change this later
          avatarUrl: fbUser.photoURL || '',
        };
        await createUserProfile(fbUser.uid, newProfile);
        profile = { id: fbUser.uid, ...newProfile };
      }
      setUser({ ...profile, uid: fbUser.uid });
    } catch (err) {
      console.error('Failed to load user profile:', err);
      setUser(null);
    }
    setAuthReady(true);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, loadUserProfile);
    return () => unsubscribe();
  }, [loadUserProfile]);

  // ─── Auth Actions ──────────────────────────────────────────────────────────

  const loginWithEmail = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await loadUserProfile(cred.user);
    return cred.user;
  };

  const registerWithEmail = async (email, password, name, role = 'student') => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await createUserProfile(cred.user.uid, {
      name,
      email,
      role,
      avatarUrl: '',
    });
    await loadUserProfile(cred.user);
    return cred.user;
  };

  const loginWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    await loadUserProfile(cred.user);
    return cred.user;
  };

  const forgotPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
  };

  // Refresh user profile from Firestore (call this after profile updates)
  const refreshUser = async () => {
    if (firebaseUser) await loadUserProfile(firebaseUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        authReady,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        forgotPassword,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
