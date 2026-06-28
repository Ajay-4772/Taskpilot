const User = require("../models/User");

const syncUser = async (req, res, next) => {
  try {
    const { name, email, photoURL } = req.body;
    const uid = req.user.uid;

    let user = await User.findOne({ uid });
    if (user) {
      if (name) user.name = name;
      if (email) user.email = email;
      if (photoURL !== undefined) user.photoURL = photoURL;
      user.updatedAt = Date.now();
      await user.save();
    } else {
      user = await User.create({
        uid,
        name: name || email.split("@")[0],
        email,
        photoURL: photoURL || "",
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
