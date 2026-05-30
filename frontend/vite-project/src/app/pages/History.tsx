import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import { api } from "../utils/api";
import {
  Search, Filter, Download, Plus, Pencil, Trash2,
  AlertCircle, RefreshCw, TrendingUp, TrendingDown, X, Eye,
} from "lucide-react";

const DEFAULT_CATEGORIES = [
  "Makanan", "Transportasi", "Hiburan", "Belanja",
  "Kesehatan", "Pendidikan", "Gaji", "Lainnya",
];

function formatRupiah(value: number) {
  return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

interface Category {
  category_id: string;
  name: string;
}

interface Transaction {
  transaction_id: number;
  type: "income" | "expense";
  amount: number;
  category_id?: string;
  category?: string;
  category_name?: string;
  description?: string;
  date: string;
  receiptUrl?: string;
  receipt_url?: string;
}

// ─── Edit Modal ────────────────────────────────────────────────────────────────

function EditModal({
  transaction, categories, onClose, onSaved,
}: {
  transaction: Transaction;
  categories: Category[];
  onClose: () => void;
  onSaved: (t: Transaction) => void;
}) {
  const [form, setForm] = useState({
    type: transaction.type || "expense",
    amount: String(transaction.amount || ""),
    category_id: transaction.category_id || "",
    description: transaction.description || "",
    date: transaction.date?.slice(0, 10) || new Date().toISOString().slice(0, 10),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) { setError("Nominal harus lebih dari 0."); return; }
    if (!form.category_id) { setError("Pilih kategori transaksi."); return; }
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
    } catch (err: unknown) {
      setError((err as Error).message || "Gagal menyimpan perubahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-gray-800">Edit Transaksi</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">Jenis</label>
            <div className="flex gap-2">
              {(["expense", "income"] as const).map((t) => (
                <button key={t} type="button" onClick={() => setForm((f) => ({ ...f, type: t }))}
                  className={`flex-1 py-2.5 rounded-xl text-sm border transition-colors ${
                    form.type === t
                      ? t === "income" ? "bg-emerald-600 text-white border-emerald-600" : "bg-red-500 text-white border-red-500"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}>
                  {t === "income" ? "Pemasukan" : "Pengeluaran"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">Nominal (Rp)</label>
            <input type="number" name="amount" value={form.amount} onChange={handleChange} required min="1"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-gray-50 focus:bg-white" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">Kategori</label>
            <select name="category_id" value={form.category_id} onChange={handleChange} required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-gray-50 focus:bg-white">
              <option value="">-- Pilih kategori --</option>
              {categories.map((c) => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">Tanggal</label>
            <input type="date" name="date" value={form.date} onChange={handleChange} required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-gray-50 focus:bg-white" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">Catatan <span className="text-gray-400">(opsional)</span></label>
            <input type="text" name="description" value={form.description} onChange={handleChange} placeholder="Misal: makan siang di kantin"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-gray-50 focus:bg-white" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors">Batal</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm transition-colors disabled:opacity-60">
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirm ────────────────────────────────────────────────────────────

function DeleteModal({ onConfirm, onCancel, loading }: { onConfirm: () => void; onCancel: () => void; loading: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-gray-800 mb-1">Hapus Transaksi?</h3>
        <p className="text-sm text-gray-400 mb-6">Transaksi yang dihapus tidak dapat dikembalikan.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors">Batal</button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm transition-colors disabled:opacity-60">
            {loading ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function History() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<string | null>(null);
  const [showNoReceiptModal, setShowNoReceiptModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("");
  const [search, setSearch] = useState("");

  const fetchAll = useCallback(() => {
    setLoading(true);
    setError("");
    Promise.all([
      api.get("/api/categories").catch(() => []),
      api.get("/api/transactions").catch((e: Error) => { throw e; }),
    ])
      .then(([cats, txs]) => {
        const normalizedCats: Category[] = Array.isArray(cats) && cats.length
          ? cats.map((c: Category) => ({ ...c, category_id: String(c.category_id) }))
          : DEFAULT_CATEGORIES.map((name, i) => ({ category_id: String(i + 1), name }));
        setCategories(normalizedCats);
        setTransactions(Array.isArray(txs) ? txs : txs?.transactions || []);
      })
      .catch((e: Error) => setError(e.message || "Gagal memuat data."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function handleDeleteConfirm() {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/api/transactions/${deletingId}`);
      setTransactions((prev) => prev.filter((t) => t.transaction_id !== deletingId));
      setDeletingId(null);
    } catch (err: unknown) {
      alert((err as Error).message || "Gagal menghapus transaksi.");
    } finally {
      setDeleteLoading(false);
    }
  }

  function handleEditSaved(updated: Transaction) {
    setTransactions((prev) => prev.map((t) => t.transaction_id === updated.transaction_id ? updated : t));
    setEditingTx(null);
  }

  function getCategoryName(t: Transaction) {
    if (t.category_name) return t.category_name;
    if (t.category) return t.category;
    const found = categories.find((c) => String(c.category_id) === String(t.category_id ?? ""));
    return found?.name || "Tanpa kategori";
  }

  function getReceiptUrl(t: Transaction) {
    return t.receiptUrl || t.receipt_url || "";
  }

  const filtered = transactions.filter((t) => {
    if (filterType && t.type !== filterType) return false;
    if (filterCategory && String(t.category_id) !== String(filterCategory) && t.category !== filterCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      const categoryName = getCategoryName(t).toLowerCase();
      if (!(t.description || "").toLowerCase().includes(q) && !categoryName.includes(q)) return false;
    }
    return true;
  });

  const hasFilter = filterCategory || filterType || search;

  function exportCSV() {
    if (!filtered.length) return;
    const headers = ["Tanggal", "Jenis", "Kategori", "Nominal", "Catatan"];
    const rows = filtered.map((t) => [
      t.date?.slice(0, 10) || "",
      t.type === "income" ? "Pemasukan" : "Pengeluaran",
      getCategoryName(t),
      Number(t.amount || 0),
      `"${(t.description || "").replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `transaksi_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  return (
    <div className="p-8 space-y-6">
      {/* Modals */}
      {editingTx && <EditModal transaction={editingTx} categories={categories} onClose={() => setEditingTx(null)} onSaved={handleEditSaved} />}
      {deletingId && <DeleteModal loading={deleteLoading} onConfirm={handleDeleteConfirm} onCancel={() => setDeletingId(null)} />}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setActiveReceipt(null)}>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-gray-800">Bukti Nota / Struk</h4>
              <button onClick={() => setActiveReceipt(null)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-2 flex justify-center max-h-[65vh] overflow-hidden">
              <img src={activeReceipt} alt="Struk" className="object-contain max-w-full max-h-[60vh] rounded-lg" />
            </div>
          </div>
        </div>
      )}

      {showNoReceiptModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowNoReceiptModal(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <h4 className="text-gray-800 text-lg font-semibold">
                  Nota / Struk Tidak Tersedia
                </h4>
                <p className="text-sm text-gray-400 mt-1">
                  Transaksi ini belum memiliki gambar nota atau struk.
                </p>
              </div>

              <button
                onClick={() => setShowNoReceiptModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-7 h-7 text-gray-400" />
              </div>

              <p className="text-gray-600 text-sm">
                Tidak ada file yang dilampirkan saat transaksi ini dibuat.
              </p>
            </div>

            <button
              onClick={() => setShowNoReceiptModal(false)}
              className="w-full mt-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm transition-colors"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-gray-900">Riwayat Transaksi</h1>
          <p className="text-sm text-gray-400 mt-0.5">{filtered.length} transaksi ditemukan</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} disabled={filtered.length === 0}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <Link to="/add" className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm rounded-xl hover:bg-emerald-700 transition-colors">
            <Plus className="w-4 h-4" /> Tambah
          </Link>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari catatan atau kategori..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-gray-50 focus:bg-white"
            />
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <Filter className="w-4 h-4" />
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white">
            <option value="">Semua Jenis</option>
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
          </select>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white">
            <option value="">Semua Kategori</option>
            {categories.map((c) => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
          </select>
          {hasFilter && (
            <button onClick={() => { setFilterCategory(""); setFilterType(""); setSearch(""); }}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-3.5 h-3.5" /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-400 text-sm">
          <RefreshCw className="w-6 h-6 mx-auto mb-3 animate-spin text-gray-300" />
          Memuat transaksi...
        </div>
      ) : error ? (
        <div className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
          <button onClick={fetchAll} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-xs font-medium">
            <RefreshCw className="w-3 h-3" /> Coba lagi
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">
            {hasFilter ? "Tidak ada transaksi yang cocok" : "Belum ada transaksi"}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {hasFilter ? "Coba ubah atau reset filter" : "Tambah transaksi pertamamu sekarang"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3.5 text-left text-xs text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-5 py-3.5 text-left text-xs text-gray-500 uppercase tracking-wider">Kategori</th>
                  <th className="px-5 py-3.5 text-left text-xs text-gray-500 uppercase tracking-wider">Jenis</th>
                  <th className="px-5 py-3.5 text-left text-xs text-gray-500 uppercase tracking-wider">Catatan</th>
                  <th className="px-5 py-3.5 text-right text-xs text-gray-500 uppercase tracking-wider">Nominal</th>
                  <th className="px-5 py-3.5 text-center text-xs text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((t) => {
                  const receiptUrl = getReceiptUrl(t);

                  return (
                    <tr
                      key={t.transaction_id}
                      onClick={() => {
                        if (receiptUrl) {
                          setActiveReceipt(receiptUrl);
                        } else {
                          setShowNoReceiptModal(true);
                        }
                      }}
                      title={receiptUrl ? "Klik untuk melihat struk" : "Tidak ada struk"}
                      className="hover:bg-gray-50 transition-colors group cursor-pointer"
                    >
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-gray-600">{formatDate(t.date)}</span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg">
                          {getCategoryName(t)}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                            t.type === "income"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {t.type === "income" ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {t.type === "income" ? "Pemasukan" : "Pengeluaran"}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="text-sm text-gray-500 truncate max-w-[160px] block">
                          {t.description || <span className="text-gray-300">—</span>}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <span
                          className={`text-sm font-semibold ${
                            t.type === "income" ? "text-emerald-600" : "text-red-500"
                          }`}
                        >
                          {t.type === "income" ? "+" : "-"}
                          {formatRupiah(t.amount)}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-center gap-1">


                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTx(t);
                            }}
                            title="Edit"
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingId(t.transaction_id);
                            }}
                            title="Hapus"
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/50 flex items-center justify-between">
            <p className="text-xs text-gray-400">{filtered.length} dari {transactions.length} transaksi</p>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-emerald-600 font-medium">
                + {formatRupiah(filtered.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0))}
              </span>
              <span className="text-red-500 font-medium">
                - {formatRupiah(filtered.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0))}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
