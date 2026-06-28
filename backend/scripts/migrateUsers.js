const dotenv = require("dotenv");
const path = require("path");
// Load backend env variables FIRST
dotenv.config({ path: path.join(__dirname, "../.env") });

const fs = require("fs");
const mongoose = require("mongoose");
const { isFirebaseInitialized } = require("../config/firebase");
const { getAuth } = require("firebase-admin/auth");
const User = require("../models/User");

const runMigration = async () => {
  if (!isFirebaseInitialized) {
    console.error(`
===================================================================
FATAL: Firebase Admin SDK is not initialized!
Please configure either:
- FIREBASE_SERVICE_ACCOUNT (JSON string)
- FIREBASE_PROJECT_ID
in your backend .env file before running this migration.
===================================================================
`);
    process.exit(1);
  }

  let dbConnection = null;
  const reportLogPath = path.join(__dirname, "../migration_report.log");

  try {
    console.log("Starting migration connection...");
    
    // Connect to MongoDB
    dbConnection = await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB database.");

    let nextPageToken;
    let totalFound = 0;
    let existingCount = 0;
    let addedCount = 0;
    let failedCount = 0;
    const failures = [];
    const authInstance = getAuth();

    do {
      // List all users from Firebase Auth
      const listUsersResult = await authInstance.listUsers(1000, nextPageToken);
      totalFound += listUsersResult.users.length;

      for (const firebaseUser of listUsersResult.users) {
        try {
          const { uid, email, displayName, emailVerified, photoURL, providerData, metadata } = firebaseUser;
          
          // Check duplicate
          const existingUser = await User.findOne({ uid });
          if (existingUser) {
            existingCount++;
            continue;
          }

          // Fetch provider
          const provider = providerData?.[0]?.providerId || "password";

          // Insert new user
          await User.create({
            uid,
            name: displayName || email?.split("@")[0] || "Workspace Member",
            email: email || `${uid}@taskflow-imported.local`,
            provider,
            emailVerified: emailVerified || false,
            photoURL: photoURL || "",
            createdAt: new Date(metadata.creationTime || Date.now()),
            updatedAt: new Date(metadata.lastSignInTime || Date.now()),
            lastLogin: new Date(metadata.lastSignInTime || Date.now())
          });

          addedCount++;
        } catch (itemError) {
          failedCount++;
          failures.push({ uid: firebaseUser.uid, email: firebaseUser.email, error: itemError.message });
          console.error(`Failed to migrate user ${firebaseUser.uid}:`, itemError.message);
        }
      }

      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);

    // Build the migration report text
    const reportText = `===================================
Firebase → MongoDB Migration Report
===================================

Firebase Users Found: ${totalFound}

Existing MongoDB Users: ${existingCount}

New Users Added: ${addedCount}

Duplicates Skipped: ${existingCount}

Failed Users: ${failedCount}
${failedCount > 0 ? `\nFailures List:\n${JSON.stringify(failures, null, 2)}` : ""}
Migration Completed Successfully
`;

    // Print to console
    console.log(reportText);

    // Save report to file log
    fs.writeFileSync(reportLogPath, reportText);
    console.log(`Migration report saved to: ${reportLogPath}`);

  } catch (error) {
    console.error("Migration execution aborted due to a fatal error:", error);
  } finally {
    if (dbConnection) {
      await mongoose.connection.close();
      console.log("MongoDB connection closed.");
    }
    process.exit(0);
  }
};

runMigration();
