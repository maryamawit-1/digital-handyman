require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:7000"], // Allow both frontends
  credentials: true
}));
app.use(express.json());

// DB connection
const db = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const requestsRoutes = require('./routes/requestsRoutes');
const providerRoutes = require('./routes/providerRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/feedback', feedbackRoutes);

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:7000"
  ],
  credentials: true
}));
// Root route
app.get('/', (req, res) => {
  res.json({ message: "Welcome to the Digital Handyman Service API" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});