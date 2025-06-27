const User = require("../models/User");



const getAllUsers = async (req, res) => {
  try {
    const usernames = req.query.usernames?.split(',') || [];

    if (usernames.length > 0) {
      const regexUsernames = usernames.map(name => new RegExp(`^${name}$`, 'i')); // case-insensitive
      const users = await User.find({
        username: { $in: regexUsernames }
      });
      return res.json(users);
    }

    // If no usernames specified, return all
    const all = await User.find({});
    res.json(all);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    res.status(500).json({ error: "Server error fetching users" });
  }
};



const createUser = async (req, res) => {
  try {
    if (!req.body.username) {
      return res.status(400).json({ message: "username is required" });
    }
    // Optionally set default for realName
    req.body.realName = req.body.realName || "";
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { getAllUsers, createUser, updateUser };
