import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { clearSession, getUser } from "../lib/api";

function Navbar() {
  const navigate = useNavigate();
  const user = getUser();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    clearSession();
    navigate("/login");
    setMenuOpen(false);
  };

  const linkClass = ({ isActive }) =>
    `rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
      isActive ? "bg-emerald-100 text-emerald-800 shadow-sm" : "text-slate-600 hover:bg-sky-50 hover:text-sky-700"
    }`;

  return (
    <header className="sticky top-0 z-20 border-b border-emerald-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-10">
        <Link to="/" className="text-2xl font-black tracking-tight text-emerald-800 sm:text-3xl">
          CRICKIFY
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          className="rounded-lg border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-700 md:hidden"
        >
          Menu
        </button>

        <nav
          className={`${
            menuOpen ? "flex" : "hidden"
          } absolute left-4 right-4 top-[74px] z-30 flex-col gap-2 rounded-xl border border-emerald-100 bg-white p-3 shadow-md md:static md:ml-auto md:flex md:flex-row md:items-center md:gap-2 md:border md:bg-white md:px-2 md:py-2`}
        >
          <NavLink to="/" className={linkClass} onClick={() => setMenuOpen(false)}>
            Marketplace
          </NavLink>
          <NavLink to="/sell" className={linkClass} onClick={() => setMenuOpen(false)}>
            Sell
          </NavLink>
          {user?.role === "ADMIN" && (
            <NavLink to="/admin" className={linkClass} onClick={() => setMenuOpen(false)}>
              Admin
            </NavLink>
          )}
          {user ? (
            <button
              onClick={handleLogout}
              className="rounded-lg border border-emerald-200 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
