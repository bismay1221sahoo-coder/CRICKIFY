import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { clearSession, getUser } from "../lib/api";

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getUser);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const syncUser = () => setUser(getUser());
    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to logout from CRICKIFY?")) return;
    clearSession();
    setUser(null);
    navigate("/login");
    setMenuOpen(false);
    setProfileOpen(false);
  };

  const linkClass = ({ isActive }) =>
    `relative px-3 py-2 text-sm font-semibold rounded-xl transition-all duration-200 whitespace-nowrap ${
      isActive
        ? "text-emerald-700 bg-emerald-50/80 shadow-sm"
        : "text-slate-500 hover:text-slate-900 hover:bg-white/60"
    }`;

  return (
    <header
      className={`sticky top-0 z-20 transition-all duration-300 ${
        scrolled
          ? "glass border-b border-white/50 shadow-sm"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-10">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black text-white shadow-md overflow-hidden"
            style={{ background: "linear-gradient(135deg, #059669 0%, #0d9488 100%)" }}>
            <span className="relative z-10">CR</span>
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: "linear-gradient(135deg, #047857 0%, #0f766e 100%)" }} />
          </span>
          <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
            CRICKIFY
          </span>
        </Link>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setMenuOpen((c) => !c)}
          className="glass flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 hover:text-slate-900 transition-colors md:hidden"
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M2 2l11 11M13 2L2 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M2 4h11M2 7.5h11M2 11h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>

        {/* Nav links */}
        <nav
          className={`${
            menuOpen ? "flex" : "hidden"
          } absolute left-0 right-0 top-[57px] z-30 flex-col gap-1 border-b border-white/50 bg-white/90 backdrop-blur-xl px-4 pb-4 pt-2 shadow-xl md:static md:flex md:flex-row md:items-center md:gap-3 md:border-0 md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none`}
        >
          <NavLink to="/" end className={linkClass} onClick={() => setMenuOpen(false)}>
            Marketplace
          </NavLink>
          <NavLink to="/sell" className={linkClass} onClick={() => setMenuOpen(false)}>
            Sell Gear
          </NavLink>
          {user && (
            <NavLink to="/my-listings" className={linkClass} onClick={() => setMenuOpen(false)}>
              My Listings
            </NavLink>
          )}
          {user?.role === "ADMIN" && (
            <NavLink to="/admin" className={linkClass} onClick={() => setMenuOpen(false)}>
              Admin
            </NavLink>
          )}

          <div className="md:ml-2 md:pl-2 md:border-l md:border-slate-200/70">
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((current) => !current)}
                  className="glass flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-white/80"
                  aria-haspopup="menu"
                  aria-expanded={profileOpen}
                >
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-black text-white"
                    style={{ background: "linear-gradient(135deg, #059669, #0d9488)" }}
                  >
                    {user.name?.[0]?.toUpperCase()}
                  </span>
                  <span className="hidden sm:inline">{user.name}</span>
                </button>

                {profileOpen && (
                  <div className="glass absolute right-0 mt-2 w-56 rounded-2xl border border-white/60 p-2 text-sm shadow-xl md:top-full">
                    <Link
                      to="/my-listings"
                      onClick={() => {
                        setProfileOpen(false);
                        setMenuOpen(false);
                      }}
                      className="block rounded-xl px-3 py-2 font-semibold text-slate-600 hover:bg-white/70 hover:text-slate-900"
                    >
                      My Listings
                    </Link>
                    <Link
                      to="/sell"
                      onClick={() => {
                        setProfileOpen(false);
                        setMenuOpen(false);
                      }}
                      className="block rounded-xl px-3 py-2 font-semibold text-slate-600 hover:bg-white/70 hover:text-slate-900"
                    >
                      Sell Gear
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full rounded-xl px-3 py-2 text-left font-semibold text-red-600 hover:bg-red-50/80"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="btn-primary rounded-xl px-5 py-2 text-sm"
              >
                Login
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
