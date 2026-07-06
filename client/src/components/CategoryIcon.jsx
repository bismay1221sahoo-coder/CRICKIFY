/**
 * Purpose-built cricket-gear line icons — one cohesive set that replaces the
 * old 3-letter text placeholders ("Bat", "Giv", "Hlm", ...).
 * Monochrome, inherit `currentColor`, sized via the `size` prop.
 */

const PATHS = {
  // Cricket ball with seam — used for "All gear"
  ALL: (
    <>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M8.4 4.8c1.6 4.3 1.6 10.1 0 14.4" />
      <path d="M15.6 4.8c-1.6 4.3-1.6 10.1 0 14.4" />
    </>
  ),
  // Cricket bat
  BAT: (
    <g transform="rotate(38 12 12)">
      <line x1="12" y1="2.5" x2="12" y2="8" />
      <path d="M10.6 2.5h2.8" />
      <rect x="9.4" y="8" width="5.2" height="13" rx="2.2" />
    </g>
  ),
  // Batting glove / mitt
  GLOVES: (
    <path d="M7 11V7.2a1.4 1.4 0 0 1 2.8 0V10M9.8 10V6.4a1.4 1.4 0 0 1 2.8 0V10M12.6 10V7a1.4 1.4 0 0 1 2.8 0V11M15.4 11V9.2a1.4 1.4 0 0 1 2.8 0v3.6A6 6 0 0 1 12.2 19h-.4a6 6 0 0 1-4.8-2.5l-2.2-3.1a1.4 1.4 0 0 1 2.3-1.6L7 11.6" />
  ),
  // Batting pad
  PADS: (
    <>
      <rect x="7" y="3" width="10" height="18" rx="3.2" />
      <path d="M7.4 8.5h9.2M7.4 12.5h9.2M7.4 16.5h9.2" />
    </>
  ),
  // Helmet with grille
  HELMET: (
    <>
      <path d="M4.5 13a7.5 7.5 0 0 1 15 0" />
      <path d="M4.5 13h15v1.5a2 2 0 0 1-2 2h-3" />
      <path d="M14.5 13v3.5M12 13v3.5" />
    </>
  ),
  // Spiked cricket shoe
  SHOES: (
    <>
      <path d="M3 15.5c3 .2 4.4-.7 6.2-2.6l1.6-1.7 1.7 2.6c.8 1.1 2.4 1.6 5 2 1.4.2 2.5 1 2.5 2.2v1.3H3z" />
      <path d="M6.5 18.8v1.4M10 18.8v1.4M13.5 18.8v1.4M17 18.8v1.4" />
    </>
  ),
  // Kit bag
  KIT: (
    <>
      <rect x="3.5" y="8" width="17" height="11" rx="2.2" />
      <path d="M9 8V6.2A3 3 0 0 1 15 6.2V8" />
      <path d="M12 11.5v4" />
    </>
  ),
  // Wickets / stumps + bails — used for "Other"
  OTHER: (
    <>
      <path d="M8 6.5V20M12 6.5V20M16 6.5V20" />
      <path d="M6.8 6.2h6.4M10.8 6.2h6.4" />
    </>
  ),
};

function CategoryIcon({ name = "ALL", size = 24, strokeWidth = 1.7, className = "" }) {
  const glyph = PATHS[name] || PATHS.ALL;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {glyph}
    </svg>
  );
}

export default CategoryIcon;
