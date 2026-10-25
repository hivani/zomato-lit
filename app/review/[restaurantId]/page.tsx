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
      <main className="mx-auto w-full max-w-[560px] px-6 py-16">
        <p className="text-sm text-accent">{loadError}</p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm text-muted underline underline-offset-4"
        >
          Go back
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[560px] px-6 py-14 sm:py-20">
      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
          Write a review
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          {name ?? ""}
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="mt-10">
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
          Your rating
        </span>

        <div
          className="mt-3 flex gap-1"
          onMouseLeave={() => setHovered(0)}
          role="group"
          aria-label="Rating"
        >
          {[1, 2, 3, 4, 5].map((value) => {
            const filled = value <= (hovered || rating);

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
                  className={`h-9 w-9 ${filled ? "text-accent" : "text-ink/25"}`}
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
          className="mt-8 block text-[11px] font-medium uppercase tracking-[0.14em] text-muted"
        >
          Your review
        </label>
        <textarea
          id="comment"
          rows={4}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="What did you eat, and how was it?"
          className="mt-3 w-full resize-none rounded-lg border border-line bg-card px-4 py-3 text-[15px] leading-relaxed placeholder:text-muted/60 focus:border-ink/30 focus:outline-none"
        />

        {error && (
          <p role="alert" className="mt-4 text-sm text-accent">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-6 w-full rounded-lg bg-ink px-5 py-3 text-sm font-medium text-paper transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
        >
          {submitting ? "Submitting…" : "Submit review"}
        </button>
      </form>
    </main>
  );
}
