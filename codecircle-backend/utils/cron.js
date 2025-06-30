const cron = require('node-cron');
const axios = require('axios');
const User = require('../models/User');

const leetcodeAPI = process.env.VITE_LEETCODE_API_URL || 'http://localhost:3000';

const updateUserData = async () => {
  try {
    const users = await User.find();
    console.log(`⏰ Running update for ${users.length} users...`);

    for (const user of users) {
      try {
        const res = await axios.get(`${leetcodeAPI}/userProfile/${user.username}`);
        const updatedData = res.data;

        await User.findOneAndUpdate(
          { username: user.username },
          { $set: updatedData }
        );

        console.log(`✅ Updated ${user.username} at ${new Date().toISOString()}`);
      } catch (err) {
        console.error(`❌ Error updating ${user.username}:`, err.message);
      }
    }
  } catch (err) {
    console.error('❌ Error fetching users:', err.message);
  }
};

// Run every hour
cron.schedule('0 * * * *', () => {
  console.log("🔁 Starting hourly update...");
  updateUserData();
});

// Run every minute for testing purposes
// cron.schedule('* * * * *', updateUserData);


module.exports = updateUserData;
