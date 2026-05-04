import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Sell from "./pages/Sell";
import MyListings from "./pages/MyListings";
import ListingDetails from "./pages/ListingDetails";
import { getUser } from "./lib/api";

const PAGE_TITLES = {
  "/":          "CRICKIFY — Buy & Sell Used Cricket Gear",
  "/login":     "Login — CRICKIFY",
  "/sell":      "Sell Gear — CRICKIFY",
  "/my-listings": "My Listings — CRICKIFY",
  "/admin":     "Admin Panel — CRICKIFY",
};

function TitleUpdater() {
  const { pathname } = useLocation();
  useEffect(() => {
    const title = PAGE_TITLES[pathname] || "CRICKIFY";
    document.title = title;
  }, [pathname]);
  return null;
}

function AdminRoute({ children }) {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "ADMIN") return <Navigate to="/" replace />;
  return children;
}

function AuthRoute({ children }) {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <div className="min-h-screen text-slate-950">
      <TitleUpdater />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/listings/:id" element={<ListingDetails />} />
        <Route path="/sell" element={<AuthRoute><Sell /></AuthRoute>} />
        <Route path="/my-listings" element={<AuthRoute><MyListings /></AuthRoute>} />
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
      </Routes>
    </div>
  );
}

export default App;
