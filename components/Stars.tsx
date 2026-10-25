// A star. Filled in the accent, outline in a whisper of ink.
// Pure decoration: it renders a rating, it never calculates one.
export function Stars({
  rating,
  size = "h-3.5 w-3.5",
}: {
  rating: number;
  size?: string;
}) {
  return (
    <span
      role="img"
      aria-label={`${rating} out of 5`}
      className="inline-flex gap-[3px]"
    >
      {[1, 2, 3, 4, 5].map((position) => {
        const filled = position <= rating;

        return (
          <svg
            key={position}
            viewBox="0 0 24 24"
            className={`${size} ${filled ? "text-accent" : "text-ink/20"}`}
            aria-hidden="true"
            fill={filled ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinejoin="round"
          >
            <path d="M12 3.4l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.5 9.6l5.9-.9z" />
          </svg>
        );
      })}
    </span>
  );
}
