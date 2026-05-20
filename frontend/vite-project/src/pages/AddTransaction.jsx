import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";

const DEFAULT_CATEGORIES = ["Makanan", "Transportasi", "Hiburan", "Belanja", "Kesehatan", "Pendidikan", "Gaji", "Lainnya"];

export default function AddTransaction() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    amount: "",
    type: "expense",
    category: "",
    date: new Date().toISOString().slice(0, 10),
    note: "",
  });
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activeClass = {
  income: "bg-emerald-600 text-white border-emerald-600",
  expense: "bg-red-500 text-white border-red-500",
  };
  const inactiveClass = "bg-white text-gray-600 border-gray-200 hover:bg-gray-50";

  useEffect(() => {
    api.get("/api/categories")
      .then((data) => {
        if (Array.isArray(data) && data.length) {
          setCategories(data.map((c) => c.name || c));
        }
      })
      .catch(() => {}); // fallback to defaults
  }, []);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.amount || Number(form.amount) <= 0) {
      setError("Nominal harus lebih dari 0.");
      return;
    }
    if (!form.category) {
      setError("Pilih kategori transaksi.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/transactions", {
        amount: Number(form.amount),
        type: form.type,
        category: form.category,
        date: form.date,
        note: form.note,
      });
      navigate("/history");
    } catch (err) {
      setError(err.message || "Gagal menyimpan transaksi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tambah Transaksi</h1>
        <p className="text-sm text-gray-500 mt-1">Catat pemasukan atau pengeluaran baru</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Jenis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Transaksi</label>
            <div className="flex gap-2">
              {["expense", "income"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, type: t }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    form.type === t ? activeClass[t] : inactiveClass
                    }`}
                >
                  {t === "income" ? "⬆️ Pemasukan" : "⬇️ Pengeluaran"}
                </button>
              ))}
            </div>
          </div>

          {/* Nominal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nominal (Rp)</label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              required
              min="1"
              placeholder="0"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
            >
              <option value="">-- Pilih kategori --</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Tanggal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catatan <span className="text-gray-400 font-normal">(opsional)</span>
            </label>
            <input
              type="text"
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="Misal: makan siang di kantin"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-60"
            >
              {loading ? "Menyimpan..." : "Simpan Transaksi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
