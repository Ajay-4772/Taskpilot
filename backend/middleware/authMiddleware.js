const { admin, isFirebaseInitialized } = require("../config/firebase");
const { getAuth } = require("firebase-admin/auth");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Auth Middleware: Access Denied. No bearer authorization header present.");
      return res.status(401).json({ message: "Access Denied: No Token Provided" });
    }

    const token = authHeader.split(" ")[1];

    if (!isFirebaseInitialized) {
      // Fallback decoding for development testing if Firebase config is missing
      try {
        const base64Url = token.split('.')[1];
        if (base64Url) {
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            Buffer.from(base64, 'base64')
              .toString()
              .split('')
              .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const decoded = JSON.parse(jsonPayload);
          // Ensure uid is mapped correctly for database query isolation
          decoded.uid = decoded.user_id || decoded.sub || decoded.uid;
          
          if (decoded.uid) {
            req.user = decoded;
            console.log(`Auth Middleware: Success via Manual Fallback. User: ${decoded.email || decoded.uid}`);
            return next();
          }
        }
      } catch (e) {
        console.error("Auth Middleware: JWT Decode Fallback Error:", e.message);
      }
      console.log("Auth Middleware: Fallback decoding failed or UID missing.");
      return res.status(401).json({ message: "Firebase Admin is not configured on backend." });
    }

    const decodedToken = await getAuth().verifyIdToken(token);
    decodedToken.uid = decodedToken.uid || decodedToken.user_id || decodedToken.sub;
    req.user = decodedToken;
    console.log(`Auth Middleware: Success via Firebase Admin. User: ${decodedToken.email}`);
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    res.status(401).json({ message: "Authentication Failed: Invalid Token" });
  }
};

module.exports = authMiddleware;
