const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Setup connection event listeners
    mongoose.connection.on("disconnected", () => {
      console.warn("Mongoose connection disconnected. Bypassing/attempting reconnection...");
    });
    mongoose.connection.on("reconnected", () => {
      console.log("Mongoose connection reestablished successfully.");
    });
    mongoose.connection.on("error", (err) => {
      console.error("Mongoose connection error occurred:", err.message);
    });

    await mongoose.connect(process.env.MONGO_URI, {
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection failed on startup:", error.message);
    console.log("Retrying MongoDB connection in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;