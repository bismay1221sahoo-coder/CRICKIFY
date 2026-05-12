const THEME_KEY = "crickify_theme";

export const getStoredTheme = () => {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return null;
};

export const getSystemTheme = () =>
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

export const getInitialTheme = () => getStoredTheme() || getSystemTheme();

export const applyTheme = (theme) => {
  document.documentElement.setAttribute("data-theme", theme);
};

export const persistTheme = (theme) => {
  localStorage.setItem(THEME_KEY, theme);
};
