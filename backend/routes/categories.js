const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const auth = require('../middleware/authMiddleware');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const DEFAULT_CATEGORIES = [
  'Makanan', 'Transportasi', 'Hiburan', 'Belanja',
  'Kesehatan', 'Pendidikan', 'Gaji', 'Lainnya',
];

// GET /api/categories — ambil semua kategori milik user
router.get('/', auth, async (req, res) => {
  const { data, error } = await supabase
    .from('categories')
    .select('category_id, name')
    .eq('user_id', req.user.user_id)
    .order('name', { ascending: true });

  if (error) return res.status(400).json({ error: error.message });

  // Kalau user belum punya kategori, seed default dulu
  if (!data || data.length === 0) {
    const inserts = DEFAULT_CATEGORIES.map((name) => ({
      user_id: req.user.user_id,
      name,
    }));

    const { data: seeded, error: seedError } = await supabase
      .from('categories')
      .insert(inserts)
      .select('category_id, name');

    if (seedError) return res.status(400).json({ error: seedError.message });
    return res.json(seeded);
  }

  res.json(data);
});

// POST /api/categories — tambah kategori custom
router.post('/', auth, async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Nama kategori tidak boleh kosong.' });
  }

  const { data, error } = await supabase
    .from('categories')
    .insert({ user_id: req.user.user_id, name: name.trim() })
    .select('category_id, name')
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

module.exports = router;