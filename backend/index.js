const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '.env' });

const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');

const app = express();

// Middleware dulu
app.use(cors());
app.use(express.json());

// Route untuk cek apakah backend hidup
app.get('/', (req, res) => {
  res.json({ message: 'Personal Expense Tracker API is running' });
});

// Routes utama
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});