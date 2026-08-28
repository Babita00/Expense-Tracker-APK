import type { Theme } from '../../../lib/theme';

const THEME_OPTIONS: Theme[] = ['system', 'light', 'dark'];

interface ThemeChoiceProps {
  theme: Theme;
  onChange: (theme: Theme) => void;
}

/** Appearance picker. "system" follows the device rather than pinning a look. */
export function ThemeChoice({ theme, onChange }: ThemeChoiceProps) {
  return (
    <div className="card is-tight">
      <div className="viewtoggle themetoggle" role="group" aria-label="Theme">
        {THEME_OPTIONS.map((option) => (
          <button
            key={option}
            aria-pressed={theme === option}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
