import { useContext, useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, Menu, Moon, ShoppingBag, Sun, X } from "lucide-react";
import { clearSession, getUser } from "../lib/api";
import { ThemeContext } from "../lib/themeContext";

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getUser);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const { theme, toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    const syncUser = () => setUser(getUser());
    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
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
    if (!window.confirm("Are you sure you want to logout?")) return;
    clearSession();
    setUser(null);
    navigate("/login");
    setMenuOpen(false);
    setProfileOpen(false);
  };

  const linkClass = ({ isActive }) =>
    `px-4 py-2 text-sm font-bold rounded-xl transition-all ${
      isActive
        ? "text-brand bg-brand-weak"
        : "text-muted hover:text-ink hover:bg-surface-2"
    }`;

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? "bg-surface/80 backdrop-blur-md border-b border-line shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-on-brand shadow-lg transition-transform group-hover:scale-110">
            <ShoppingBag size={20} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-black tracking-tight text-ink">
            CRICKIFY
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex md:items-center md:gap-2">
          <NavLink to="/" end className={linkClass}>
            Marketplace
          </NavLink>
          <NavLink to="/sell" className={linkClass}>
            Sell Gear
          </NavLink>
          {user && (
            <NavLink to="/my-listings" className={linkClass}>
              My Listings
            </NavLink>
          )}
          {user?.role === "ADMIN" && (
            <NavLink to="/admin" className={linkClass}>
              Admin
            </NavLink>
          )}

          <div className="mx-2 h-4 w-px bg-line" />

          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-muted hover:bg-surface-2 hover:text-ink transition-colors"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user ? (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className={`flex items-center gap-2 rounded-xl border p-1 pr-3 transition-all ${
                  profileOpen ? "border-brand bg-brand-weak" : "border-line bg-surface hover:border-faint shadow-sm"
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-on-brand text-xs font-bold">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-xs font-bold text-ink">{user.name.split(" ")[0]}</span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-3 w-56 origin-top-right overflow-hidden rounded-2xl border border-line bg-surface shadow-xl elevated">
                  <div className="p-4 bg-surface-2/50">
                    <p className="text-xs font-black text-ink truncate">{user.name}</p>
                    <p className="text-[10px] font-bold text-muted mt-0.5">Verified Player</p>
                  </div>
                  <div className="h-px bg-line" />
                  <div className="p-2">
                    <Link
                      to="/my-listings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-bold text-muted hover:bg-brand-weak hover:text-brand transition-colors"
                    >
                      <ShoppingBag size={14} />
                      Your Submissions
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-bold text-danger hover:bg-danger/10 transition-colors"
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-primary py-2 px-6 ml-2">
              Login
            </Link>
          )}
        </nav>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-3 md:hidden">
          <button onClick={toggleTheme} className="text-muted">
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {user && (
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-sm font-black text-on-brand shadow-sm"
              aria-label="Open account menu"
            >
              {user.name?.[0]?.toUpperCase()}
            </button>
          )}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-muted hover:text-ink"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute inset-x-0 top-full border-b border-line bg-surface shadow-xl elevated md:hidden">
          <nav className="flex flex-col p-4">
            {user && (
              <div className="mb-3 rounded-2xl border border-line bg-surface-2/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-sm font-black text-on-brand">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-ink">{user.name}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Verified Player</p>
                  </div>
                </div>
              </div>
            )}
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
                Admin Panel
              </NavLink>
            )}
            {user && (
              <button
                type="button"
                onClick={handleLogout}
                className="mt-3 flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold text-danger transition-colors hover:bg-danger/10"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            )}
            {!user && (
              <Link to="/login" className="btn-primary mt-4 py-3" onClick={() => setMenuOpen(false)}>
                Login to Crickify
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;
