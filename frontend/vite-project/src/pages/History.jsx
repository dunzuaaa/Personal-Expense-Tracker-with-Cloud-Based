import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { api } from "../utils/api";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_CATEGORIES = [
  "Makanan", "Transportasi", "Hiburan", "Belanja",
  "Kesehatan", "Pendidikan", "Gaji", "Lainnya",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRupiah(value) {
  return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({ transaction, categories, onClose, onSaved }) {
  const [form, setForm] = useState({
    type: transaction.type || "expense",
    amount: transaction.amount || "",
    category_id: transaction.category_id || "",
    description: transaction.description || "",
    date: transaction.date?.slice(0, 10) || new Date().toISOString().slice(0, 10),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    if (!form.category_id) {
      setError("Pilih kategori transaksi.");
      return;
    }

    setLoading(true);
    try {
      const updated = await api.put(`/api/transactions/${transaction.transaction_id}`, {
        type: form.type,
        amount: Number(form.amount),
        category_id: form.category_id,
        description: form.description,
        date: form.date,
      });
      onSaved(updated);
    } catch (err) {
      setError(err.message || "Gagal menyimpan perubahan.");
    } finally {
      setLoading(false);
    }
  }

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleBackdrop}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Edit Transaksi</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          {/* Jenis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis</label>
            <div className="flex gap-2">
              {["expense", "income"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, type: t }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors
                    ${form.type === t
                      ? t === "income"
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-red-500 text-white border-red-500"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
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
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
            >
              <option value="">-- Pilih kategori --</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.name}
                </option>
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
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Misal: makan siang di kantin"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-60"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteConfirmModal({ onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 text-center">
        <div className="text-4xl mb-3">🗑️</div>
        <h3 className="text-base font-semibold text-gray-800 mb-1">Hapus Transaksi?</h3>
        <p className="text-sm text-gray-500 mb-6">Transaksi yang dihapus tidak dapat dikembalikan.</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-60"
          >
            {loading ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function History() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingTx, setEditingTx] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("");
  const [search, setSearch] = useState("");

  // Fetch categories once
  useEffect(() => {
    api.get("/api/categories")
      .then((data) => {
        if (Array.isArray(data) && data.length) {
          setCategories(data);
        } else {
          setCategories(DEFAULT_CATEGORIES.map((name, i) => ({ category_id: String(i + 1), name })));
        }
      })
      .catch(() => {
        setCategories(DEFAULT_CATEGORIES.map((name, i) => ({ category_id: String(i + 1), name })));
      });
  }, []);

  // Fetch transactions
  const fetchTransactions = useCallback(() => {
    setLoading(true);
    setError("");
    api.get("/api/transactions")
      .then((data) => setTransactions(Array.isArray(data) ? data : data.transactions || []))
      .catch((e) => setError(e.message || "Gagal memuat transaksi."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  // Delete
  async function handleDeleteConfirm() {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/api/transactions/${deletingId}`);
      setTransactions((prev) => prev.filter((t) => t.transaction_id !== deletingId));
      setDeletingId(null);
    } catch (err) {
      alert(err.message || "Gagal menghapus transaksi.");
    } finally {
      setDeleteLoading(false);
    }
  }

  // Edit saved — update local state tanpa refetch
  function handleEditSaved(updated) {
    setTransactions((prev) =>
      prev.map((t) => (t.transaction_id === updated.transaction_id ? updated : t))
    );
    setEditingTx(null);
  }

  // Client-side filtering
  const filtered = transactions.filter((t) => {
    if (filterType && t.type !== filterType) return false;
    if (filterCategory && t.category_id !== filterCategory && t.category !== filterCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      const inDesc = (t.description || "").toLowerCase().includes(q);
      const inCat = (t.category || "").toLowerCase().includes(q);
      if (!inDesc && !inCat) return false;
    }
    return true;
  });

  function getCategoryName(t) {
    if (t.category) return t.category;
    const found = categories.find((c) => c.category_id === t.category_id);
    return found?.name || "Tanpa kategori";
  }

  const hasFilter = filterCategory || filterType || search;

  return (
    <div className="p-8 space-y-6">
      {/* Modals */}
      {editingTx && (
        <EditModal
          transaction={editingTx}
          categories={categories}
          onClose={() => setEditingTx(null)}
          onSaved={handleEditSaved}
        />
      )}
      {deletingId && (
        <DeleteConfirmModal
          loading={deleteLoading}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingId(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Riwayat Transaksi</h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} transaksi ditemukan</p>
        </div>
        <Link
          to="/add"
          className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
        >
          + Tambah
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="🔍 Cari catatan atau kategori..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-40 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <option value="">Semua Jenis</option>
          <option value="income">Pemasukan</option>
          <option value="expense">Pengeluaran</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <option value="">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c.category_id} value={c.category_id}>{c.name}</option>
          ))}
        </select>
        {hasFilter && (
          <button
            onClick={() => { setFilterCategory(""); setFilterType(""); setSearch(""); }}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ✕ Reset
          </button>
        )}
      </div>

      {/* Transaction list */}
      {loading ? (
        <div className="text-center text-gray-400 py-12">Memuat transaksi...</div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-4">
          {error}
          <button onClick={fetchTransactions} className="ml-2 underline">Coba lagi</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-400">
          <p className="text-3xl mb-2">📭</p>
          <p>{hasFilter ? "Tidak ada transaksi yang cocok dengan filter." : "Belum ada transaksi."}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {filtered.map((t) => (
            <div
              key={t.transaction_id}
              className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors group"
            >
              {/* Left: icon + info */}
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0
                  ${t.type === "income" ? "bg-emerald-50" : "bg-red-50"}`}>
                  {t.type === "income" ? "⬆️" : "⬇️"}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {getCategoryName(t)}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {formatDate(t.date)}{t.description ? ` · ${t.description}` : ""}
                  </p>
                </div>
              </div>

              {/* Right: amount + action buttons */}
              <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                <span className={`text-sm font-semibold ${t.type === "income" ? "text-emerald-600" : "text-red-500"}`}>
                  {t.type === "income" ? "+" : "-"}{formatRupiah(t.amount)}
                </span>

                {/* Action buttons — visible on hover */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingTx(t)}
                    title="Edit"
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => setDeletingId(t.transaction_id)}
                    title="Hapus"
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}