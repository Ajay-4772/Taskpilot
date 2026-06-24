import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, googleProvider, isFirebaseConfigured } from "../firebase/firebaseConfig";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("taskpilot_user");
    const storedToken = localStorage.getItem("taskpilot_token");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      setLoading(false);
      return;
    }

    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const idToken = await firebaseUser.getIdToken();
            const userDetails = {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || firebaseUser.email.split("@")[0],
              email: firebaseUser.email,
              photoURL: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${firebaseUser.email}&background=7C5CFC&color=fff`
            };
            setUser(userDetails);
            setToken(idToken);
            localStorage.setItem("taskpilot_user", JSON.stringify(userDetails));
            localStorage.setItem("taskpilot_token", idToken);
          } catch (err) {
            console.error("Error getting user token:", err);
          }
        } else {
          setUser(null);
          setToken(null);
          localStorage.removeItem("taskpilot_user");
          localStorage.removeItem("taskpilot_token");
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured) {
      throw new Error("Firebase is not configured. Please supply VITE_FIREBASE_* parameters in your environment.");
    }
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const userDetails = {
        uid: result.user.uid,
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL
      };
      setUser(userDetails);
      setToken(idToken);
      localStorage.setItem("taskpilot_user", JSON.stringify(userDetails));
      localStorage.setItem("taskpilot_token", idToken);
      return userDetails;
    } catch (error) {
      console.error("Google Auth Error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email, password) => {
    if (!isFirebaseConfigured) {
      throw new Error("Firebase is not configured. Please supply VITE_FIREBASE_* parameters in your environment.");
    }
    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await result.user.getIdToken();
      const userDetails = {
        uid: result.user.uid,
        displayName: result.user.displayName || email.split("@")[0],
        email: result.user.email,
        photoURL: result.user.photoURL || `https://ui-avatars.com/api/?name=${email}&background=7C5CFC&color=fff`
      };
      setUser(userDetails);
      setToken(idToken);
      localStorage.setItem("taskpilot_user", JSON.stringify(userDetails));
      localStorage.setItem("taskpilot_token", idToken);
      return userDetails;
    } catch (error) {
      console.error("Email Login Error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signupWithEmail = async (email, password, displayName) => {
    if (!isFirebaseConfigured) {
      throw new Error("Firebase is not configured. Please supply VITE_FIREBASE_* parameters in your environment.");
    }
    try {
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await result.user.getIdToken();
      const userDetails = {
        uid: result.user.uid,
        displayName: displayName || email.split("@")[0],
        email: result.user.email,
        photoURL: `https://ui-avatars.com/api/?name=${displayName || email}&background=7C5CFC&color=fff`
      };
      setUser(userDetails);
      setToken(idToken);
      localStorage.setItem("taskpilot_user", JSON.stringify(userDetails));
      localStorage.setItem("taskpilot_token", idToken);
      return userDetails;
    } catch (error) {
      console.error("Signup Error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      if (isFirebaseConfigured && auth) {
        await signOut(auth);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("taskpilot_user");
      localStorage.removeItem("taskpilot_token");
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    loading,
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    logout,
    isFirebaseConfigured
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
