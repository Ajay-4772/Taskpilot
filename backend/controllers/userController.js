const User = require("../models/User");

const syncUser = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const emailFromToken = req.user.email || "";
    const nameFromToken = req.user.name || emailFromToken.split("@")[0] || "Workspace Member";
    const photoFromToken = req.user.picture || "";
    const verifiedFromToken = req.user.email_verified || false;
    
    // Extract provider from Firebase token metadata
    let providerFromToken = "password";
    if (req.user.firebase?.sign_in_provider) {
      providerFromToken = req.user.firebase.sign_in_provider;
    }

    const { name: bodyName, email: bodyEmail, photoURL: bodyPhoto } = req.body;

    const targetName = bodyName || nameFromToken;
    const targetEmail = bodyEmail || emailFromToken;
    const targetPhoto = bodyPhoto !== undefined ? bodyPhoto : photoFromToken;

    let user = await User.findOne({ uid });
    if (user) {
      let hasChanges = false;
      
      if (user.name !== targetName && targetName) {
        user.name = targetName;
        hasChanges = true;
      }
      if (user.email !== targetEmail && targetEmail) {
        user.email = targetEmail;
        hasChanges = true;
      }
      if (user.photoURL !== targetPhoto && targetPhoto !== undefined) {
        user.photoURL = targetPhoto;
        hasChanges = true;
      }
      if (user.emailVerified !== verifiedFromToken) {
        user.emailVerified = verifiedFromToken;
        hasChanges = true;
      }
      if (user.provider !== providerFromToken) {
        user.provider = providerFromToken;
        hasChanges = true;
      }

      user.lastLogin = Date.now();
      user.updatedAt = Date.now();
      await user.save();
    } else {
      // Create new user automatically in MongoDB
      user = await User.create({
        uid,
        name: targetName || "Workspace Member",
        email: targetEmail || `${uid}@taskpilot-sync.local`,
        provider: providerFromToken,
        emailVerified: verifiedFromToken,
        photoURL: targetPhoto || "",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastLogin: Date.now()
      });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, photoURL } = req.body;
    const updateData = { updatedAt: Date.now() };
    
    if (name !== undefined) updateData.name = name;
    if (photoURL !== undefined) updateData.photoURL = photoURL;

    const user = await User.findOneAndUpdate(
      { uid: req.user.uid },
      updateData,
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

const updateEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOneAndUpdate(
      { uid: req.user.uid },
      { email, updatedAt: Date.now() },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  syncUser,
  getMe,
  updateProfile,
  updateEmail,
  updatePassword
};
