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
  sendEmailVerification,
  sendPasswordResetEmail
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

// Setup Axios request interceptor to dynamically append fresh Firebase ID token on every request
axios.interceptors.request.use(
  async (config) => {
    try {
      if (auth && auth.currentUser) {
        const idToken = await auth.currentUser.getIdToken();
        config.headers["Authorization"] = `Bearer ${idToken}`;
      } else {
        const localToken = localStorage.getItem("taskpilot_token");
        if (localToken) {
          config.headers["Authorization"] = `Bearer ${localToken}`;
        }
      }
    } catch (e) {
      console.warn("Could not inject Firebase ID token in interceptor:", e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const localUser = localStorage.getItem("taskpilot_user");
    return localUser ? JSON.parse(localUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("taskpilot_token"));
  const [loading, setLoading] = useState(() => {
    // If we have cached credentials, initialize immediately without blocking loader screens
    return !localStorage.getItem("taskpilot_token");
  });
  const [authError, setAuthError] = useState(null);

  // Synchronize authenticated Firebase Auth user with MongoDB
  const syncUserDoc = async (firebaseUser, customName = null) => {
    if (!firebaseUser) return null;
    
    const displayName = customName || firebaseUser.displayName || firebaseUser.email.split("@")[0];
    
    // Call Express Backend API to sync profile in MongoDB
    const response = await axios.post(
      `${getBaseUrl()}/users/sync`,
      { 
        name: displayName, 
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL || "" 
      },
      { timeout: 8000 } // 8 seconds timeout
    );

    const dbUser = response.data;
    const userDetails = {
      uid: firebaseUser.uid,
      displayName: dbUser.name,
      email: dbUser.email,
      photoURL: dbUser.photoURL || "",
      createdAt: dbUser.createdAt
    };

    setUser(userDetails);
    localStorage.setItem("taskpilot_user", JSON.stringify(userDetails));
    return userDetails;
  };

  const retrySync = async () => {
    setAuthError(null);
    setLoading(true);
    try {
      // Test server health
      await axios.get(`${getBaseUrl()}/health`, { timeout: 5000 });
      
      if (auth.currentUser) {
        const idToken = await auth.currentUser.getIdToken(true);
        setToken(idToken);
        await syncUserDoc(auth.currentUser);
      }
      setLoading(false);
    } catch (err) {
      console.error("Retry connection failed:", err);
      setAuthError({
        type: "server",
        message: "Unable to connect to the server. Please try again."
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    // Run startup health check to verify backend availability before loading data
    const verifyBackendHealth = async () => {
      try {
        await axios.get(`${getBaseUrl()}/health`, { timeout: 5000 });
      } catch (err) {
        console.warn("Backend connectivity check failed on startup:", err.message);
        // Only set blocking connection error if we are logged in (requires backend transactions)
        if (localStorage.getItem("taskpilot_token")) {
          setAuthError({
            type: "server",
            message: "Unable to connect to the server. Please try again."
          });
          setLoading(false);
        }
      }
    };

    verifyBackendHealth();

    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const idToken = await firebaseUser.getIdToken();
            setToken(idToken);
            localStorage.setItem("taskpilot_token", idToken);
            
            // Set loading to false early if session cache exists to optimize rendering
            if (localStorage.getItem("taskpilot_user")) {
              setLoading(false);
            }
            
            await syncUserDoc(firebaseUser);
            setAuthError(null);
          } catch (error) {
            console.error("Error verifying authenticated user session:", error);
            // Ignore expired token warnings on startup since interceptor handles it
            if (error.code !== "auth/id-token-expired") {
              setAuthError({
                type: "server",
                message: "Connection failed. Backend server timed out or is unavailable."
              });
            }
          }
        } else {
          setUser(null);
          setToken(null);
          localStorage.removeItem("taskpilot_user");
          localStorage.removeItem("taskpilot_token");
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
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
    await syncUserDoc(result.user, name);
    return result.user;
  };

  const updateUserProfile = async (displayName, photoURL = undefined) => {
    if (!auth.currentUser) throw new Error("No authenticated user");
    
    const updates = {};
    if (displayName !== undefined) updates.displayName = displayName;
    if (photoURL !== undefined) updates.photoURL = photoURL;

    await updateProfile(auth.currentUser, updates);
    
    // Sync update to MongoDB
    const response = await axios.put(`${getBaseUrl()}/users/profile`, { 
      name: displayName,
      photoURL: photoURL 
    });
    
    // Sync local state details
    const userDetails = {
      uid: auth.currentUser.uid,
      displayName: response.data.name,
      email: response.data.email,
      photoURL: response.data.photoURL || "",
      createdAt: response.data.createdAt
    };
    setUser(userDetails);
    localStorage.setItem("taskpilot_user", JSON.stringify(userDetails));
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

  const sendPasswordReset = async () => {
    if (!auth.currentUser) throw new Error("No authenticated user");
    await sendPasswordResetEmail(auth, auth.currentUser.email);
  };

  const sendForgotPasswordEmail = async (email) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase Authentication is not configured.");
    }
    await sendPasswordResetEmail(auth, email);
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
    authError,
    retrySync,
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    logout,
    updateUserProfile,
    updateUserEmail,
    sendPasswordReset,
    sendForgotPasswordEmail,
    isFirebaseConfigured
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
