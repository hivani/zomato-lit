"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

const STAR_LABELS = ["1 star", "2 stars", "3 stars", "4 stars", "5 stars"];

export default function ReviewPage() {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const router = useRouter();

  const [name, setName] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // We need the restaurant's name for the heading. It comes from the same API
  // the other screen uses - no separate endpoint, no invented data.
  useEffect(() => {
    let cancelled = false;

    fetch(`/api/restaurants/${restaurantId}`)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) {
          throw new Error(body.error ?? "Could not load this restaurant.");
        }
        return body as { name: string };
      })
      .then((body) => {
        if (!cancelled) setName(body.name);
      })
      .catch((caught: Error) => {
        if (!cancelled) setLoadError(caught.message);
      });

    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  const canSubmit = rating > 0 && comment.trim().length > 0 && !submitting;
  const shown = hovered || rating;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restaurantId: Number(restaurantId),
        rating,
        comment,
      }),
    });

    const body = await response.json();

    if (!response.ok) {
      // Show the backend's own words. Never invent a friendlier message.
      setError(body.error ?? "Something went wrong.");
      setSubmitting(false);
      return;
    }

    router.push(`/restaurant/${restaurantId}`);
  }

  if (loadError) {
    return (
      <main className="mx-auto flex min-h-[70vh] w-full max-w-[560px] flex-col justify-center px-6">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-accent">
          Not found
        </p>
        <h1 className="mt-3 text-[1.75rem] font-semibold leading-snug tracking-[-0.02em]">
          {loadError}
        </h1>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex h-11 items-center rounded-lg border border-ink/15 px-5 text-sm font-medium transition-colors hover:border-ink/30 hover:bg-ink/[0.03]"
          >
            Go back
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[560px] px-6 py-12 sm:py-16">
      <header className="border-b border-line pb-8">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
          Write a review
        </p>
        <h1 className="mt-3 text-balance text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.02em] sm:text-[2.1rem]">
          {name ?? "\u00A0"}
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="mt-10">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
            Your rating
          </span>
          <span className="text-xs text-muted">
            {rating > 0 ? `${rating} of 5` : ""}
          </span>
        </div>

        <div
          className="mt-4 flex gap-1.5"
          onMouseLeave={() => setHovered(0)}
          role="group"
          aria-label="Rating"
        >
          {[1, 2, 3, 4, 5].map((value) => {
            const filled = value <= shown;

            return (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHovered(value)}
                aria-label={STAR_LABELS[value - 1]}
                aria-pressed={rating === value}
                className="rounded-md p-0.5 transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <svg
                  viewBox="0 0 24 24"
                  className={`h-10 w-10 ${filled ? "text-accent" : "text-ink/20"}`}
                  aria-hidden="true"
                  fill={filled ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinejoin="round"
                >
                  <path d="M12 3.4l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.5 9.6l5.9-.9z" />
                </svg>
              </button>
            );
          })}
        </div>

        <label
          htmlFor="comment"
          className="mt-10 block text-[10px] font-medium uppercase tracking-[0.18em] text-muted"
        >
          Your review
        </label>
        <textarea
          id="comment"
          rows={4}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="What did you eat, and how was it?"
          className="mt-3 min-h-32 w-full resize-none rounded-xl border border-line bg-card px-4 py-3.5 text-[15px] leading-relaxed placeholder:text-muted/60 focus:border-ink/25 focus:outline-none focus:ring-4 focus:ring-ink/[0.04]"
        />

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-lg border border-accent/20 bg-accent/[0.04] px-4 py-3 text-sm leading-relaxed text-accent"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-7 h-12 w-full rounded-lg bg-ink text-sm font-medium text-paper transition-colors hover:bg-[#26261f] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-ink"
        >
          {submitting ? "Submitting…" : "Submit review"}
        </button>
      </form>
    </main>
  );
}
