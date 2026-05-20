import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../utils/api";

function formatRupiah(value) {
  return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function History() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (filterCategory) params.set("category", filterCategory);
    if (filterType) params.set("type", filterType);
    if (filterFrom) params.set("from", filterFrom);
    if (filterTo) params.set("to", filterTo);

    setLoading(true);
    api.get(`/api/transactions?${params.toString()}`)
      .then((data) => setTransactions(Array.isArray(data) ? data : data.transactions || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filterCategory, filterType, filterFrom, filterTo]);

  const categories = [...new Set(transactions.map((t) => t.category))].filter(Boolean);

  const filtered = transactions.filter((t) =>
    search === "" ||
    (t.note || "").toLowerCase().includes(search.toLowerCase()) ||
    (t.category || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
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
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input
          type="date"
          value={filterFrom}
          onChange={(e) => setFilterFrom(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
        <input
          type="date"
          value={filterTo}
          onChange={(e) => setFilterTo(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
        {(filterCategory || filterType || filterFrom || filterTo || search) && (
          <button
            onClick={() => { setFilterCategory(""); setFilterType(""); setFilterFrom(""); setFilterTo(""); setSearch(""); }}
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
        <div className="text-red-500 py-4">Gagal memuat: {error}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-400">
          <p className="text-3xl mb-2">📭</p>
          <p>Tidak ada transaksi.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {filtered.map((t) => (
            <div key={t.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg
                  ${t.type === "income" ? "bg-emerald-50" : "bg-red-50"}`}>
                  {t.type === "income" ? "⬆️" : "⬇️"}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {t.category || "Tanpa kategori"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(t.date)}{t.note ? ` · ${t.note}` : ""}
                  </p>
                </div>
              </div>
              <span className={`text-sm font-semibold ${t.type === "income" ? "text-emerald-600" : "text-red-500"}`}>
                {t.type === "income" ? "+" : "-"}{formatRupiah(t.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
