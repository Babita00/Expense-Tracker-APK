const EMOJI_CHOICES = [
  '🍛', '🍗', '🥜', '🍎', '☕', '🍺', '🏋️', '🎽', '👕', '👟',
  '🛵', '🚕', '🚌', '⛽', '📱', '💡', '🏠', '🎉', '🎬', '🎮',
  '🛍️', '💊', '🏥', '📚', '✏️', '✈️', '🏕️', '🎁', '💇', '🧾',
  '🐕', '👶', '💰', '📌',
];

interface EmojiPickerProps {
  value: string;
  onChange: (icon: string) => void;
  label?: string;
}

/** The icon field: one tap target per emoji, single selection. */
export function EmojiPicker({ value, onChange, label = 'Icon' }: EmojiPickerProps) {
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <div className="emoji-grid">
        {EMOJI_CHOICES.map((choice) => (
          <button
            key={choice}
            type="button"
            className="cat-chip"
            aria-pressed={value === choice}
            aria-label={`Icon ${choice}`}
            onClick={() => onChange(choice)}
          >
            <span className="emoji" aria-hidden="true">{choice}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
