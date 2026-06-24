const admin = require("firebase-admin");

let isFirebaseInitialized = false;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.cert(serviceAccount)
    });
    console.log("Firebase Admin Initialized with service account");
    isFirebaseInitialized = true;
  } else if (process.env.FIREBASE_PROJECT_ID) {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID
    });
    console.log("Firebase Admin Initialized with Project ID");
    isFirebaseInitialized = true;
  } else {
    console.warn("WARNING: Firebase env variables missing. Running in local/demo auth mode.");
  }
} catch (error) {
  console.error("Firebase Admin initialization failed:", error.message);
}

module.exports = {
  admin,
  isFirebaseInitialized
};
