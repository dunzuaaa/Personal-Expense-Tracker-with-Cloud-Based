const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '.env' });

const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const summaryRoutes = require('./routes/summary');
const categoryRoutes = require('./routes/categories');

// 1. TAMBAHAN: Import middleware upload S3 yang baru kita buat
const upload = require('./middleware/upload'); 

// Inisialisasi app (HARUS DI ATAS)
const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://personal-expense-tracker-alpha-drab.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());

// Routes Dasar
app.get('/', (req, res) => {
  res.json({ message: 'Personal Expense Tracker API is running' });
});

app.use('/api/summary', summaryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);

// 2. TAMBAHAN: Endpoint API untuk menerima upload foto struk dan melemparnya ke S3
app.post('/api/upload-struk', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Tidak ada file yang diunggah' });
    }
    
    // URL gambar publik dari S3 yang nantinya disimpan ke database (Supabase)
    const imageUrl = req.file.location; 
    
    res.status(200).json({
      message: 'Foto struk berhasil diunggah ke AWS S3!',
      url: imageUrl
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Listen Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});