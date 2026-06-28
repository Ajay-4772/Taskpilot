const User = require("../models/User");

const syncUser = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const uid = req.user.uid;

    let user = await User.findOne({ uid });
    if (user) {
      if (name) user.name = name;
      if (email) user.email = email;
      user.updatedAt = Date.now();
      await user.save();
    } else {
      user = await User.create({
        uid,
        name: name || email.split("@")[0],
        email,
        createdAt: Date.now(),
        updatedAt: Date.now()
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
    const { name } = req.body;
    const user = await User.findOneAndUpdate(
      { uid: req.user.uid },
      { name, updatedAt: Date.now() },
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
    // Password details are modified securely in Firebase Auth.
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
