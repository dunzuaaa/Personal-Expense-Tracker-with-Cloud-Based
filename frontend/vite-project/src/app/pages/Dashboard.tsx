import { useState, useEffect } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  TrendingUp, TrendingDown, Wallet, AlertCircle, RefreshCw,
} from "lucide-react";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router";

const CHART_COLORS = [
  "#10b981", "#f59e0b", "#3b82f6", "#ef4444",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316",
];

function formatRupiah(value: number) {
  return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
}

interface StatCardProps {
  label: string;
  value: number;
  type: "income" | "expense" | "balance";
}

function StatCard({ label, value, type }: StatCardProps) {
  const config = {
    income: {
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      text: "text-emerald-700",
      sub: "text-emerald-600",
      icon: TrendingUp,
      iconBg: "bg-emerald-100",
    },
    expense: {
      bg: "bg-red-50",
      border: "border-red-100",
      text: "text-red-700",
      sub: "text-red-600",
      icon: TrendingDown,
      iconBg: "bg-red-100",
    },
    balance: {
      bg: "bg-blue-50",
      border: "border-blue-100",
      text: "text-blue-700",
      sub: "text-blue-600",
      icon: Wallet,
      iconBg: "bg-blue-100",
    },
  };
  const c = config[type];
  const Icon = c.icon;

  return (
    <div className={`rounded-2xl border ${c.border} ${c.bg} p-5`}>
      <div className="flex items-start justify-between mb-3">
        <p className={`text-sm ${c.sub}`}>{label}</p>
        <div className={`w-9 h-9 rounded-xl ${c.iconBg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${c.text}`} />
        </div>
      </div>
      <p className={`text-2xl font-semibold ${c.text}`}>
        {formatRupiah(value)}
      </p>
    </div>
  );
}

interface CategoryEntry {
  category: string;
  total: number;
}

interface Summary {
  total_income: number;
  total_expense: number;
  balance: number;
  by_category: CategoryEntry[];
}

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  function fetchSummary() {
    setLoading(true);
    setError("");
    api.get("/api/summary")
      .then(setSummary)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchSummary(); }, []);

  const pieData = summary?.by_category?.map((c) => ({
    name: c.category,
    value: Number(c.total),
  })) || [];

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="p-8 space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">{today}</p>
        </div>
        {user && (
          <div className="text-right">
            <p className="text-sm text-gray-600">Halo, <span className="font-medium text-gray-800">{user.name || user.email}</span></p>
            <p className="text-xs text-gray-400 mt-0.5">Ringkasan keuangan Anda</p>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>Gagal memuat data: {error}</span>
          </div>
          <button
            onClick={fetchSummary}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-xs font-medium"
          >
            <RefreshCw className="w-3 h-3" /> Coba lagi
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-2xl border border-gray-100 bg-gray-50 p-5 animate-pulse">
              <div className="h-4 w-24 bg-gray-200 rounded mb-4" />
              <div className="h-7 w-32 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Summary cards — horizontal row */}
      {!loading && summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total Pemasukan" value={summary.total_income} type="income" />
          <StatCard label="Total Pengeluaran" value={summary.total_expense} type="expense" />
          <StatCard label="Saldo Bersih" value={summary.balance} type="balance" />
        </div>
      )}

      {/* Pie chart */}
      {!loading && pieData.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-gray-800">Pengeluaran per Kategori</h2>
              <p className="text-sm text-gray-400 mt-0.5">{pieData.length} kategori tercatat</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                
                outerRadius={115}
                
                dataKey="value"
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [formatRupiah(value), "Total"]}
                contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span style={{ color: "#374151", fontSize: "13px" }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && pieData.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">Belum ada transaksi</p>
          <p className="text-sm text-gray-400 mt-1">Mulai catat pemasukan atau pengeluaran pertamamu</p>
          <Link
            to="/add"
            className="inline-block mt-5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm transition-colors"
          >
            + Tambah Transaksi
          </Link>
        </div>
      )}
    </div>
  );
}
