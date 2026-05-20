const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '.env' });

const authRoutes = require('./routes/auth');

const transactionRoutes = require('./routes/transactions');

const app = express();

app.use('/api/transactions', transactionRoutes);
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));