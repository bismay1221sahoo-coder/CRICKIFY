import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Sell from "./pages/Sell";
import ListingDetails from "./pages/ListingDetails";

function App() {
  return (
    <div className="min-h-screen text-slate-950">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/sell" element={<Sell />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/listings/:id" element={<ListingDetails />} />
      </Routes>
    </div>
  );
}

export default App;
