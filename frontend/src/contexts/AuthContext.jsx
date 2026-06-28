import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, googleProvider, db, isFirebaseConfigured } from "../firebase/firebaseConfig";
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
import { doc, getDoc, setDoc } from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Create or sync user profile under `users/{uid}` in Firestore
  const syncUserDoc = async (firebaseUser, customName = null) => {
    if (!firebaseUser) return;
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    const displayName = customName || firebaseUser.displayName || firebaseUser.email.split("@")[0];
    const userDetails = {
      uid: firebaseUser.uid,
      displayName,
      email: firebaseUser.email,
      photoURL: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=18181b&color=fff`,
      metadata: {
        creationTime: firebaseUser.metadata.creationTime,
        lastSignInTime: firebaseUser.metadata.lastSignInTime
      }
    };

    if (!userDocSnap.exists()) {
      await setDoc(userDocRef, {
        name: displayName,
        email: firebaseUser.email,
        createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()).toISOString()
      });
    }

    setUser(userDetails);
    localStorage.setItem("taskflow_user", JSON.stringify(userDetails));
    return userDetails;
  };

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const idToken = await firebaseUser.getIdToken();
            setToken(idToken);
            localStorage.setItem("taskflow_token", idToken);
            await syncUserDoc(firebaseUser);
          } catch (error) {
            console.error("Error syncing authenticated user state:", error);
          }
        } else {
          setUser(null);
          setToken(null);
          localStorage.removeItem("taskflow_user");
          localStorage.removeItem("taskflow_token");
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
      }
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase Authentication is not configured.");
    }
    const result = await signInWithPopup(auth, googleProvider);
    await syncUserDoc(result.user);
    return result.user;
  };

  const loginWithEmail = async (email, password) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase Authentication is not configured.");
    }
    const result = await signInWithEmailAndPassword(auth, email, password);
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
    await syncUserDoc(result.user, name);
    return result.user;
  };

  const updateUserProfile = async (displayName) => {
    if (!auth.currentUser) throw new Error("No authenticated user");
    await updateProfile(auth.currentUser, { displayName });
    
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    await setDoc(userDocRef, { name: displayName }, { merge: true });

    return await syncUserDoc(auth.currentUser, displayName);
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

    const userDocRef = doc(db, "users", auth.currentUser.uid);
    await setDoc(userDocRef, { email: newEmail }, { merge: true });
  };

  const updateUserPassword = async (currentPassword, newPassword) => {
    if (!auth.currentUser) throw new Error("No authenticated user");
    const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
    await reauthenticateWithCredential(auth.currentUser, credential);
    await updatePassword(auth.currentUser, newPassword);
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
    updateUserProfile,
    updateUserEmail,
    updateUserPassword,
    isFirebaseConfigured
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
