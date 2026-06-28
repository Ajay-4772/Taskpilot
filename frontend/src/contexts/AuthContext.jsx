import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, googleProvider, isFirebaseConfigured } from "../firebase/firebaseConfig";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  updateEmail,
  verifyBeforeUpdateEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification
} from "firebase/auth";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const getBaseUrl = () => {
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1" || host.startsWith("192.168.")) {
    return `http://${host}:5000`;
  }
  return "https://taskpilot-api-c3s3.onrender.com";
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Synchronize authenticated Firebase Auth user with MongoDB
  const syncUserDoc = async (firebaseUser, customName = null) => {
    if (!firebaseUser) return null;
    
    const displayName = customName || firebaseUser.displayName || firebaseUser.email.split("@")[0];
    
    // Call Express Backend API to sync profile in MongoDB
    const response = await axios.post(
      `${getBaseUrl()}/users/sync`,
      { name: displayName, email: firebaseUser.email },
      { timeout: 10000 } // 10 seconds timeout constraint
    );

    const dbUser = response.data;
    const userDetails = {
      uid: firebaseUser.uid,
      displayName: dbUser.name,
      email: dbUser.email,
      photoURL: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(dbUser.name)}&background=18181b&color=fff`,
      createdAt: dbUser.createdAt
    };

    setUser(userDetails);
    localStorage.setItem("taskflow_user", JSON.stringify(userDetails));
    return userDetails;
  };

  const retrySync = async () => {
    setAuthError(null);
    setLoading(true);
    if (auth.currentUser) {
      try {
        const idToken = await auth.currentUser.getIdToken(true);
        setToken(idToken);
        axios.defaults.headers.common["Authorization"] = `Bearer ${idToken}`;
        await syncUserDoc(auth.currentUser);
      } catch (err) {
        console.error("Retry sync failed:", err);
        setAuthError({
          type: "server",
          message: "Unable to reach backend server. Please verify the API is running."
        });
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const idToken = await firebaseUser.getIdToken();
            setToken(idToken);
            localStorage.setItem("taskflow_token", idToken);
            axios.defaults.headers.common["Authorization"] = `Bearer ${idToken}`;
            
            await syncUserDoc(firebaseUser);
            setAuthError(null);
          } catch (error) {
            console.error("Error verifying authenticated user session:", error);
            setAuthError({
              type: "server",
              message: "Connection failed. Backend server timed out or is unavailable."
            });
          }
        } else {
          setUser(null);
          setToken(null);
          localStorage.removeItem("taskflow_user");
          localStorage.removeItem("taskflow_token");
          delete axios.defaults.headers.common["Authorization"];
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      const localUser = localStorage.getItem("taskflow_user");
      const localToken = localStorage.getItem("taskflow_token");
      if (localUser && localToken) {
        setUser(JSON.parse(localUser));
        setToken(localToken);
        axios.defaults.headers.common["Authorization"] = `Bearer ${localToken}`;
      }
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase Authentication is not configured.");
    }
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    setToken(idToken);
    axios.defaults.headers.common["Authorization"] = `Bearer ${idToken}`;
    await syncUserDoc(result.user);
    return result.user;
  };

  const loginWithEmail = async (email, password) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase Authentication is not configured.");
    }
    const result = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await result.user.getIdToken();
    setToken(idToken);
    axios.defaults.headers.common["Authorization"] = `Bearer ${idToken}`;
    await syncUserDoc(result.user);
    return result.user;
  };

  const signupWithEmail = async (email, password, name) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase Authentication is not configured.");
    }
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    try {
      await sendEmailVerification(result.user);
    } catch (e) {
      console.warn("Failed to send verification email:", e);
    }
    const idToken = await result.user.getIdToken();
    setToken(idToken);
    axios.defaults.headers.common["Authorization"] = `Bearer ${idToken}`;
    await syncUserDoc(result.user, name);
    return result.user;
  };

  const updateUserProfile = async (displayName) => {
    if (!auth.currentUser) throw new Error("No authenticated user");
    await updateProfile(auth.currentUser, { displayName });
    
    // Sync update to MongoDB
    const response = await axios.put(`${getBaseUrl()}/users/profile`, { name: displayName });
    
    // Sync local state details
    const userDetails = {
      uid: auth.currentUser.uid,
      displayName: response.data.name,
      email: response.data.email,
      photoURL: auth.currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(response.data.name)}&background=18181b&color=fff`,
      createdAt: response.data.createdAt
    };
    setUser(userDetails);
    localStorage.setItem("taskflow_user", JSON.stringify(userDetails));
    return userDetails;
  };

  const updateUserEmail = async (currentPassword, newEmail) => {
    if (!auth.currentUser) throw new Error("No authenticated user");
    const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
    await reauthenticateWithCredential(auth.currentUser, credential);
    
    if (typeof verifyBeforeUpdateEmail === "function") {
      await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
    } else {
      await updateEmail(auth.currentUser, newEmail);
    }

    // Sync update to MongoDB
    await axios.put(`${getBaseUrl()}/users/email`, { email: newEmail });
  };

  const updateUserPassword = async (currentPassword, newPassword) => {
    if (!auth.currentUser) throw new Error("No authenticated user");
    const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
    await reauthenticateWithCredential(auth.currentUser, credential);
    await updatePassword(auth.currentUser, newPassword);
    
    // Alert backend (optional sync)
    await axios.put(`${getBaseUrl()}/users/password`, {});
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
      localStorage.removeItem("taskflow_user");
      localStorage.removeItem("taskflow_token");
      delete axios.defaults.headers.common["Authorization"];
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    loading,
    authError,
    retrySync,
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    logout,
    updateUserProfile,
    updateUserEmail,
    updateUserPassword,
    isFirebaseConfigured
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
