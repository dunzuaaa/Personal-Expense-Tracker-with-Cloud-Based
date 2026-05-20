const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const auth = require('../middleware/authMiddleware');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

router.get('/', auth, async (req, res) => {
  const user_id = req.user.user_id;

  const { data, error } = await supabase
    .from('transactions')
    .select('type, amount, categories(name)')
    .eq('user_id', user_id);

  if (error) return res.status(400).json({ error: error.message });

  let total_income = 0;
  let total_expense = 0;
  const categoryMap = {};

  data.forEach((t) => {
    const amount = Number(t.amount);
    if (t.type === 'income') total_income += amount;
    else total_expense += amount;

    if (t.type === 'expense') {
      const cat = t.categories?.name || 'Lainnya';
      categoryMap[cat] = (categoryMap[cat] || 0) + amount;
    }
  });

  const by_category = Object.entries(categoryMap).map(([category, total]) => ({
    category,
    total,
  }));

  res.json({
    total_income,
    total_expense,
    balance: total_income - total_expense,
    by_category,
  });
});

module.exports = router;