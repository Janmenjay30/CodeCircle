const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
require('./utils/cron');

const updateUserData=require('./utils/cron')

app.post('/run-cron', async (req, res) => {
  
  try {
    await updateUserData();
    res.status(200).json({ message: 'User data updated!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  
 
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));

// Routes
const userRoutes = require("./routes/userRoutes");
app.get("/", (req, res) => {
  res.send("Peer-Rank backend is live 🚀");
});

app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  updateUserData(); // Initial data updateq
});
