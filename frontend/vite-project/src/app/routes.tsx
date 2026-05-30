import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import AddTransaction from "./pages/AddTransaction";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    Component: ProtectedRoute,
    children: [
      {
        Component: Layout,
        children: [
          { path: "/dashboard", Component: Dashboard },
          { path: "/history", Component: History },
          { path: "/add", Component: AddTransaction },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);
