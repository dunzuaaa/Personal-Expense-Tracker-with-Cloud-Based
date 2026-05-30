import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { api } from "../utils/api";
import {
  TrendingUp, TrendingDown, AlertCircle, Upload, CheckCircle2, ArrowLeft,
} from "lucide-react";

const DEFAULT_CATEGORIES = [
  "Makanan", "Transportasi", "Hiburan", "Belanja",
  "Kesehatan", "Pendidikan", "Gaji", "Lainnya",
];

export default function AddTransaction() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    amount: "",
    type: "expense" as "expense" | "income",
    category: "",
    date: new Date().toISOString().slice(0, 10),
    note: "",
  });
  const [customCategory, setCustomCategory] = useState("");
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    api.get("/api/categories")
      .then((data: unknown) => {
        if (Array.isArray(data) && data.length) {
          setCategories(data.map((c: { name?: string }) => c.name || String(c)));
        }
      })
      .catch(() => {});
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.amount || Number(form.amount) <= 0) { setError("Nominal harus lebih dari 0."); return; }
    const finalCategory =
      form.category === "__custom__" ? customCategory.trim() : form.category;

    if (!finalCategory) {
      setError("Pilih atau isi kategori transaksi.");
      return;
    }

    setLoading(true);
    let receiptUrl = "";

    try {
      if (selectedFile) {
        const uploadData = await api.uploadReceipt(selectedFile);

        console.log("uploadData:", uploadData);

        receiptUrl =
          uploadData.url ||
          uploadData.receipt_url ||
          uploadData.receiptUrl ||
          uploadData.location ||
          "";
      }

      await api.post("/api/transactions", {
        amount: Number(form.amount),
        type: form.type,
        category: finalCategory,
        note: form.note,
        date: form.date,
        receiptUrl,
      });

      navigate("/history");
    } catch (err: unknown) {
      setError((err as Error).message || "Gagal menyimpan transaksi.");
    } finally {
      setLoading(false);
    }
  }

  const isIncome = form.type === "income";

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-gray-900">Tambah Transaksi</h1>
          <p className="text-sm text-gray-400 mt-0.5">Catat pemasukan atau pengeluaran baru</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 mb-5 p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Type toggle header */}
        <div className="flex">
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, type: "expense" }))}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm transition-colors ${
              !isIncome
                ? "bg-red-500 text-white"
                : "bg-gray-50 text-gray-500 hover:bg-gray-100"
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            Pengeluaran
          </button>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, type: "income" }))}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm transition-colors ${
              isIncome
                ? "bg-emerald-600 text-white"
                : "bg-gray-50 text-gray-500 hover:bg-gray-100"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Pemasukan
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Amount */}
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">Nominal</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">Rp</span>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                required
                min="1"
                placeholder="0"
                className={`w-full pl-12 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 bg-gray-50 focus:bg-white transition-colors ${
                  isIncome ? "focus:ring-emerald-400" : "focus:ring-red-400"
                } border-gray-200`}
              />
            </div>
          </div>

          {/* Category + Date in a row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Kategori</label>
              <select
                name="category"
                value={form.category}
                onChange={(e) => {
                  handleChange(e);
                  if (e.target.value !== "__custom__") {
                    setCustomCategory("");
                  }
                }}
                required
                className={`w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 bg-gray-50 focus:bg-white transition-colors ${
                  isIncome ? "focus:ring-emerald-400" : "focus:ring-red-400"
                }`}
              >
                <option value="">-- Pilih kategori --</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="__custom__">+ Tambah kategori baru</option>
              </select>

              {form.category === "__custom__" && (
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Masukkan nama kategori baru"
                  className={`mt-3 w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 bg-gray-50 focus:bg-white transition-colors ${
                    isIncome ? "focus:ring-emerald-400" : "focus:ring-red-400"
                  }`}
                />
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Tanggal</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 bg-gray-50 focus:bg-white transition-colors ${
                  isIncome ? "focus:ring-emerald-400" : "focus:ring-red-400"
                }`}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">
              Catatan <span className="text-gray-400">(opsional)</span>
            </label>
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="Misal: makan siang di kantin"
              rows={2}
              className={`w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 bg-gray-50 focus:bg-white transition-colors resize-none ${
                isIncome ? "focus:ring-emerald-400" : "focus:ring-red-400"
              }`}
            />
          </div>

          {/* File upload */}
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">
              Upload Nota / Struk <span className="text-gray-400">(opsional)</span>
            </label>
            <label className="flex items-center gap-3 px-4 py-3 border border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
              {selectedFile ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-sm text-emerald-700 truncate">{selectedFile.name}</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-400">Pilih gambar nota atau struk...</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])}
                className="sr-only"
              />
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-3 text-white rounded-xl text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                isIncome
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {loading ? "Menyimpan..." : "Simpan Transaksi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
