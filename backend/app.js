require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const db = require('./config/db');

const adminRoutes = require('./routes/adminRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const requestsRoutes = require('./routes/requestsRoutes');
const providerRoutes = require('./routes/providerRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const authRoutes = require('./routes/authRoutes');



app.use(cors());
app.use(express.json());

app.use('/admin', adminRoutes);
app.use('/services', serviceRoutes);
app.use('/requests', requestsRoutes);
app.use('/providers', providerRoutes);
app.use('/feedback', feedbackRoutes);
// auth routes (mounted for admin auth)
app.use('/api/auth', authRoutes);
//app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({ message: "Welcome to the Digital Handyman Service API" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
