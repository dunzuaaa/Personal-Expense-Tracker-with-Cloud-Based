# Personal-Expense-Tracker-with-Cloud-Based
Personal Expense Tracker with Cloud-Based using AWS Cloud Service


# Personal Expense Tracker — Frontend

## Struktur File yang Perlu Dibuat

```
src/
├── main.jsx                    ← entry point, wrap AuthProvider
├── App.jsx                     ← router setup
├── context/
│   └── AuthContext.jsx         ← JWT state management
├── utils/
│   └── api.js                  ← fetch wrapper dengan auto-inject token
├── components/
│   ├── ProtectedRoute.jsx      ← guard untuk halaman private
│   └── Layout.jsx              ← sidebar + outlet
└── pages/
    ├── Login.jsx
    ├── Register.jsx
    ├── Dashboard.jsx
    ├── History.jsx
    └── AddTransaction.jsx
```

## Setup & Install

```bash
# 1. Install dependencies
npm install react-router-dom recharts

# 2. Buat file environment
cp .env.example .env.local
# Edit VITE_API_URL sesuai URL backend

# 3. Jalankan dev server
npm run dev
```

## Alur Auth

1. User buka `/` → redirect ke `/dashboard`
2. `ProtectedRoute` cek token di localStorage → kalau kosong, redirect ke `/login`
3. User submit form login → `POST /api/auth/login` → dapat `{ token }`
4. Token disimpan ke localStorage via `AuthContext.login()`
5. Redirect ke `/dashboard`

## API Endpoints yang Digunakan

| Method | Path | Deskripsi |
|--------|------|-----------|
| POST | /api/auth/register | Registrasi user baru |
| POST | /api/auth/login | Login, response: `{ token }` |
| GET | /api/summary | Total income/expense/balance + breakdown per kategori |
| GET | /api/transactions | List transaksi (query params: category, type, from, to) |
| POST | /api/transactions | Tambah transaksi baru |
| GET | /api/categories | List kategori |

## Response Format yang Diharapkan

### GET /api/summary
```json
{
  "total_income": 5000000,
  "total_expense": 2000000,
  "balance": 3000000,
  "by_category": [
    { "category": "Makanan", "total": 800000 },
    { "category": "Transportasi", "total": 300000 }
  ]
}
```

### GET /api/transactions
```json
[
  {
    "id": 1,
    "amount": 50000,
    "type": "expense",
    "category": "Makanan",
    "date": "2026-05-18",
    "note": "Makan siang"
  }
]
```





cd /workspaces/Personal-Expense-Tracker-with-Cloud-Based/backend
node index.js

cd /workspaces/Personal-Expense-Tracker-with-Cloud-Based/frontend/vite-project
npm run dev