import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const CATEGORIES = ["BAT", "GLOVES", "PADS", "HELMET", "SHOES", "KIT", "OTHER"];

const CATEGORY_META = {
  ALL: { icon: "All", label: "All Gear", gradient: "from-emerald-500 to-teal-500", bg: "from-emerald-950/80 to-teal-900/80", bgImage: "https://res.cloudinary.com/dzlz0w47q/image/upload/v1777923286/thumbnail_IMG_1983_vzy0xp.jpg" },
  BAT: { icon: "Bat", label: "Bats", gradient: "from-amber-500 to-orange-500", bg: "from-amber-950/80 to-orange-900/80", bgImage: "https://res.cloudinary.com/dzlz0w47q/image/upload/v1777923285/606010_DSC_1213_31Jan2024-scaled-e1709300843109_oqqrkq.webp" },
  GLOVES: { icon: "Glv", label: "Gloves", gradient: "from-sky-500 to-blue-600", bg: "from-sky-950/80 to-blue-900/80", bgImage: "https://res.cloudinary.com/dzlz0w47q/image/upload/v1777923284/images_sd4ywb.jpg" },
  PADS: { icon: "Pad", label: "Pads", gradient: "from-violet-500 to-purple-600", bg: "from-violet-950/80 to-purple-900/80", bgImage: "https://res.cloudinary.com/dzlz0w47q/image/upload/v1777923286/image_c08621c8-3d28-4c6b-b792-4019c239bb5f_zlnfiq.webp" },
  HELMET: { icon: "Hlm", label: "Helmets", gradient: "from-red-500 to-rose-600", bg: "from-red-950/80 to-rose-900/80", bgImage: "https://res.cloudinary.com/dzlz0w47q/image/upload/v1777923533/Cricket-Helmets_r8r873_c_crop_w_1000_h_340_wdoy4r.webp" },
  SHOES: { icon: "Sho", label: "Shoes", gradient: "from-cyan-500 to-sky-600", bg: "from-cyan-950/80 to-sky-900/80", bgImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1600&q=80" },
  KIT: { icon: "Kit", label: "Full Kits", gradient: "from-lime-500 to-green-600", bg: "from-lime-950/80 to-green-900/80", bgImage: "https://res.cloudinary.com/dzlz0w47q/image/upload/v1777923285/2CE-banner_ummbw1.webp" },
  OTHER: { icon: "Oth", label: "Other", gradient: "from-slate-500 to-slate-600", bg: "from-slate-800/80 to-slate-900/80", bgImage: "https://res.cloudinary.com/dzlz0w47q/image/upload/v1777923285/cricket-equipment-sportswear-set-players-tool-vector-icons-field-bat-ball-helmet-wicket-stumps-shoe-uniform-gloves-tools-219002067_bjjcu6.webp" },
};

const ALL_SECTIONS = ["ALL", ...CATEGORIES];

function CategorySection({ catKey }) {
  const meta = CATEGORY_META[catKey];

  return (
    <section id={`cat-${catKey}`} className="relative overflow-hidden">
      <Link
        to={`/categories/${catKey}`}
        className="group relative flex min-h-[30vh] w-full items-center justify-center overflow-hidden text-left sm:min-h-[36vh] lg:min-h-[42vh]"
      >
        {meta.bgImage ? (
          <>
            <div
              className="absolute inset-0 scale-100 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url(${meta.bgImage})` }}
            />
            <div className="absolute inset-0 bg-black/50" />
          </>
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${meta.bg}`} />
        )}

        <div className="relative z-10 flex flex-col items-center gap-2 px-4 text-center sm:gap-3">
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white sm:text-sm">{meta.icon}</span>
          <h2 className={`bg-gradient-to-r ${meta.gradient} bg-clip-text text-4xl font-black tracking-tight text-transparent drop-shadow-lg sm:text-6xl lg:text-7xl`}>
            {meta.label}
          </h2>
          <p className="text-xs font-semibold text-white/70 sm:text-sm">
            Tap to browse
          </p>
        </div>
      </Link>

      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent sm:mx-6 lg:mx-10" />
    </section>
  );
}

function Home() {
  const [activeSection, setActiveSection] = useState("ALL");
  const pillsRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace("cat-", "");
            setActiveSection(id);
            const pill = pillsRef.current?.querySelector(`[data-cat="${id}"]`);
            pill?.scrollIntoView({ inline: "center", behavior: "smooth", block: "nearest" });
          }
        });
      },
      { threshold: 0.3 }
    );

    ALL_SECTIONS.forEach((cat) => {
      const el = document.getElementById(`cat-${cat}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (catKey) => {
    document.getElementById(`cat-${catKey}`)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main>
      <section className="relative overflow-hidden border-b border-white/40 py-10 sm:py-14 lg:py-20">
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full opacity-30 blur-3xl" style={{ background: "radial-gradient(circle, #6ee7b7, transparent 70%)" }} />
        <div className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #7dd3fc, transparent 70%)" }} />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_400px] lg:items-center lg:gap-12">
            <div className="fade-in-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50/80 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-700 backdrop-blur-sm">
                Verified cricket marketplace
              </span>
              <h1 className="mt-5 text-4xl font-black leading-[1.06] tracking-tight text-slate-950 sm:mt-6 sm:text-6xl lg:text-7xl">
                Buy & sell used
                <br />
                <span className="gradient-text">cricket gear</span>
                <br />
                <span className="text-3xl font-black text-slate-400 sm:text-5xl lg:text-6xl">locally.</span>
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-relaxed text-slate-500 sm:mt-6 sm:text-base">
                Every listing is manually verified by our admin before going live. No scams, no surprises.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 sm:mt-8">
                <Link to="/sell" className="btn-primary">
                  List your gear
                </Link>
                <Link to="/categories/ALL" className="glass inline-flex items-center rounded-xl px-5 py-3 text-sm font-bold text-slate-700 transition-all duration-200 hover:bg-white/80">
                  Browse listings
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "100%", label: "Admin verified", gradient: "from-emerald-500 to-teal-500" },
                { value: "Local", label: "City-level focus", gradient: "from-sky-500 to-blue-500" },
                { value: "Free", label: "No listing fee", gradient: "from-violet-500 to-purple-500" },
                { value: "Safe", label: "No payment needed", gradient: "from-amber-500 to-orange-500" },
              ].map((stat) => (
                <div key={stat.label} className="glass card-hover relative overflow-hidden rounded-2xl p-4 sm:p-5">
                  <div className={`absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10 blur-xl`} />
                  <p className={`bg-gradient-to-br ${stat.gradient} bg-clip-text text-xl font-black text-transparent sm:text-2xl`}>{stat.value}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="sticky top-[57px] z-10 glass border-b border-white/40 shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-2.5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:px-10">
          <div ref={pillsRef} className="flex w-full gap-2 overflow-x-auto scrollbar-none lg:w-auto">
            {ALL_SECTIONS.map((cat) => {
              const meta = CATEGORY_META[cat];
              return (
                <button
                  key={cat}
                  data-cat={cat}
                  onClick={() => scrollTo(cat)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
                    activeSection === cat ? "text-white shadow-md" : "glass text-slate-600 hover:text-slate-900"
                  }`}
                  style={activeSection === cat ? { background: `linear-gradient(135deg, ${getGradientColors(meta.gradient)})` } : {}}
                >
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {ALL_SECTIONS.map((cat) => (
        <CategorySection key={cat} catKey={cat} />
      ))}
    </main>
  );
}

function getGradientColors(gradientClass) {
  const map = {
    "from-emerald-500 to-teal-500": "#10b981, #14b8a6",
    "from-amber-500 to-orange-500": "#f59e0b, #f97316",
    "from-sky-500 to-blue-600": "#0ea5e9, #2563eb",
    "from-violet-500 to-purple-600": "#8b5cf6, #9333ea",
    "from-red-500 to-rose-600": "#ef4444, #e11d48",
    "from-cyan-500 to-sky-600": "#06b6d4, #0284c7",
    "from-lime-500 to-green-600": "#84cc16, #16a34a",
    "from-slate-500 to-slate-600": "#64748b, #475569",
  };
  return map[gradientClass] || "#059669, #0d9488";
}

export default Home;
