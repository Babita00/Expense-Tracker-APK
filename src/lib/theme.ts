export type Theme = 'system' | 'light' | 'dark';

const KEY = 'nepali-expense-tracker/theme';

export function loadTheme(): Theme {
  try {
    const value = localStorage.getItem(KEY);
    if (value === 'light' || value === 'dark' || value === 'system') return value;
  } catch {
    // storage blocked - fall through to the system default
  }
  return 'system';
}

/**
 * "system" removes the stamp entirely so `prefers-color-scheme` decides;
 * the explicit choices stamp `data-theme`, which wins in both directions.
 */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', theme);

  try {
    localStorage.setItem(KEY, theme);
  } catch {
    // nothing to do - the theme still applies for this session
  }
}
