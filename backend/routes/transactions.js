const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const auth = require('../middleware/authMiddleware');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// GET semua transaksi user
router.get('/', auth, async (req, res) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, categories(name)')
    .eq('user_id', req.user.user_id)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// POST tambah transaksi
router.post('/', auth, async (req, res) => {
  try {
    const {
      amount,
      type,
      category,
      note,
      date,
      receipt_url,
      receiptUrl
    } = req.body;

    const finalReceiptUrl = receipt_url || receiptUrl || null;

    if (!amount || !type || !category || !date) {
      return res.status(400).json({ error: 'Data transaksi belum lengkap' });
    }

    // Cari category_id berdasarkan nama kategori
    let category_id = null;

    const { data: catData, error: catError } = await supabase
      .from('categories')
      .select('category_id')
      .eq('name', category)
      .eq('user_id', req.user.user_id)
      .maybeSingle();

    if (catError) {
      return res.status(400).json({ error: catError.message });
    }

    if (catData) {
      category_id = catData.category_id;
    } else {
      // Kalau kategori belum ada, buat kategori baru
      const { data: newCat, error: newCatError } = await supabase
        .from('categories')
        .insert([
          {
            name: category,
            user_id: req.user.user_id
          }
        ])
        .select('category_id')
        .single();

      if (newCatError) {
        return res.status(400).json({ error: newCatError.message });
      }

      category_id = newCat.category_id;
    }

    // Simpan transaksi
    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: req.user.user_id,
          amount,
          type,
          category_id,
          description: note,
          date,
          receipt_url: finalReceiptUrl
        },
      ])
      .select();

    if (error) return res.status(400).json({ error: error.message });

    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT edit transaksi
router.put('/:id', auth, async (req, res) => {
  const { type, amount, category_id, description, date } = req.body;

  const { data, error } = await supabase
    .from('transactions')
    .update({ type, amount, category_id, description, date })
    .eq('transaction_id', req.params.id)
    .eq('user_id', req.user.user_id)
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data[0]);
});

// DELETE hapus transaksi
router.delete('/:id', auth, async (req, res) => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('transaction_id', req.params.id)
    .eq('user_id', req.user.user_id);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Transaksi dihapus' });
});

module.exports = router;