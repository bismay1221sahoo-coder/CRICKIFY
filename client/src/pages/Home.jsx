import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, ShieldCheck, Tag, Zap } from "lucide-react";
import CategoryIcon from "../components/CategoryIcon";

const CATEGORIES = [
  {
    id: "BAT",
    label: "Cricket Bats",
    description: "English & Kashmir Willow",
    image: "https://images.unsplash.com/photo-1593341646782-e0b495cff86d?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "GLOVES",
    label: "Batting Gloves",
    description: "Pro-grade protection",
    image: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "PADS",
    label: "Leg Guards",
    description: "Lightweight batting pads",
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "HELMET",
    label: "Helmets",
    description: "Safety certified gear",
    image: "https://images.unsplash.com/photo-1589188734056-cb8293963884?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "SHOES",
    label: "Shoes",
    description: "Spikes & rubber studs",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "KIT",
    label: "Full Kits",
    description: "Complete gear bags",
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "OTHER",
    label: "Accessories",
    description: "Balls, grips, & more",
    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200&auto=format&fit=crop",
  },
];

const ALL_CATEGORY = {
  id: "ALL",
  label: "All Marketplace",
  description: "View all gear",
  image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1200&auto=format&fit=crop",
};

function Home() {
  return (
    <main className="min-h-screen bg-canvas">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 lg:pt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="fade-in-up space-y-8">
              <div>
                <span className="chip chip-brand-soft mb-4">
                  <ShieldCheck size={12} className="mr-1" />
                  Admin Verified Marketplace
                </span>
                <h1 className="text-5xl font-black leading-[1.05] text-ink sm:text-6xl lg:text-7xl">
                  Buy & sell used <br />
                  <span className="text-brand">cricket gear</span> <br />
                  with confidence.
                </h1>
                <p className="mt-6 max-w-lg text-lg text-muted">
                  The most trusted platform for local players to trade verified gear. 
                  No scams, just pure cricket.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link to="/sell" className="btn-primary py-4 px-8 text-base">
                  List your gear
                  <ArrowRight size={18} />
                </Link>
                <Link to="/categories/ALL" className="btn-ghost py-4 px-8 text-base">
                  Browse marketplace
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4 sm:grid-cols-4">
                {[
                  { icon: CheckCircle2, label: "Verified", sub: "Manually checked" },
                  { icon: Zap, label: "Local", sub: "In your city" },
                  { icon: Tag, label: "Zero Fee", sub: "Free to list" },
                  { icon: ShieldCheck, label: "Secure", sub: "Peer-to-peer" },
                ].map((stat) => (
                  <div key={stat.label} className="space-y-1.5">
                    <stat.icon size={20} className="text-brand" />
                    <div>
                      <p className="text-sm font-bold text-ink">{stat.label}</p>
                      <p className="text-[11px] font-medium text-muted">{stat.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="aspect-[4/5] overflow-hidden rounded-[2.5rem] border-8 border-surface shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1400&auto=format&fit=crop" 
                  alt="Cricket match" 
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid Section */}
      <section className="bg-surface py-20 sm:py-24 border-t border-line">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-black text-ink sm:text-4xl">Browse by category</h2>
            <p className="mt-2 text-muted">Find exactly what you need for your next match</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[ALL_CATEGORY, ...CATEGORIES].map((cat) => (
              <Link
                key={cat.id}
                to={`/categories/${cat.id}`}
                className="group relative isolate min-h-56 overflow-hidden rounded-2xl border border-line bg-surface shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand/50 hover:shadow-xl"
              >
                <img
                  src={cat.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07120c]/90 via-[#07120c]/45 to-[#07120c]/15" />
                <div className="absolute inset-x-0 top-0 h-px bg-white/25" />
                <div className="relative flex h-full min-h-56 flex-col justify-end p-6 text-left">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 text-brand shadow-lg backdrop-blur-sm transition group-hover:bg-brand group-hover:text-on-brand">
                    <CategoryIcon name={cat.id} size={26} />
                  </div>
                  <h3 className="text-2xl font-black leading-none text-white">{cat.label}</h3>
                  <p className="mt-2 text-sm font-bold text-white/75">{cat.description}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/80">
                    Tap to browse
                    <ArrowRight size={14} className="transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-canvas">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] bg-[#101814] px-8 py-12 text-center text-white shadow-xl sm:px-16 sm:py-20">
            <div className="absolute inset-0">
              <img 
                src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1600&auto=format&fit=crop" 
                alt="Stadium background" 
                className="h-full w-full object-cover opacity-35"
              />
            </div>
            <div className="absolute inset-0 bg-[#101814]/65" />
            <div className="relative z-10 mx-auto max-w-2xl">
              <h2 className="text-3xl font-black text-white sm:text-4xl lg:text-5xl">Ready to upgrade your game?</h2>
              <p className="mt-4 text-white/80">List your unused gear today and get it in front of thousands of local players.</p>
              <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                <Link to="/sell" className="inline-flex items-center justify-center rounded-xl bg-white px-10 py-3.5 text-sm font-black text-[#101814] shadow-lg transition hover:bg-slate-100">
                  List Gear Now
                </Link>
                <Link to="/categories/ALL" className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-10 py-3.5 text-sm font-black text-white transition hover:bg-white/20">
                  Browse Marketplace
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;
