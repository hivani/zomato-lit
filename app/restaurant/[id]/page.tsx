"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Stars } from "@/components/Stars";

type Review = {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
};

type Restaurant = {
  name: string;
  cuisine: string;
  area: string;
  averageRating: number | null;
  totalReviews: number;
  latestReview: Review | null;
  reviews: Review[];
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export default function RestaurantPage() {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/restaurants/${id}`)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) {
          throw new Error(body.error ?? "Could not load this restaurant.");
        }
        return body as Restaurant;
      })
      .then((body) => {
        if (!cancelled) setRestaurant(body);
      })
      .catch((caught: Error) => {
        if (!cancelled) setError(caught.message);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return (
      <main className="mx-auto flex min-h-[70vh] w-full max-w-[560px] flex-col justify-center px-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
          Not found
        </p>
        <h1 className="mt-3 text-[1.75rem] font-semibold leading-snug tracking-[-0.02em]">
          {error}
        </h1>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex h-11 items-center rounded-lg border border-ink/20 px-5 text-sm font-medium transition-colors hover:border-ink/40 hover:bg-ink/[0.04]"
          >
            Go back
          </Link>
        </div>
      </main>
    );
  }

  if (!restaurant) {
    return (
      <main className="mx-auto w-full max-w-[560px] px-6 py-12 sm:py-16">
        <div className="animate-pulse space-y-3">
          <div className="h-9 w-3/4 rounded bg-ink/[0.08]" />
          <div className="h-4 w-1/3 rounded bg-ink/[0.06]" />
        </div>
        <div className="mt-8 h-32 animate-pulse rounded-xl bg-ink/10" />
        <div className="mt-4 h-36 animate-pulse rounded-xl bg-card" />
      </main>
    );
  }

  const hasReviews = restaurant.totalReviews > 0;

  return (
    <main className="mx-auto w-full max-w-[560px] px-6 py-12 sm:py-16">
      {/* Section 1 — who you are looking at. The name carries the accent. */}
      <header className="pb-8">
        <h1 className="text-balance text-[2rem] font-semibold leading-[1.08] tracking-[-0.025em] text-accent sm:text-[2.5rem]">
          {restaurant.name}
        </h1>
        <p className="mt-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
          {restaurant.cuisine} · {restaurant.area}
        </p>
      </header>

      {/* Section 2 — the number, on its own dark band so it cannot be missed. */}
      {hasReviews && (
        <section className="rounded-xl bg-ink px-6 py-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-paper/60">
            Average rating
          </p>
          <div className="mt-3 flex items-end gap-4">
            {/*
              This is the line. The average is printed exactly as the API sent
              it. There is no addition, division, rounding or sorting here.
            */}
            <span className="text-[4rem] font-semibold leading-[0.8] tracking-[-0.04em] tabular-nums text-paper sm:text-[4.75rem]">
              {restaurant.averageRating}
            </span>
            <span className="pb-1 text-sm font-medium text-paper/70">
              {restaurant.totalReviews}{" "}
              {restaurant.totalReviews === 1 ? "review" : "reviews"}
            </span>
          </div>
        </section>
      )}

      {/* Section 3 — the newest voice, on white so it stands apart. */}
      {restaurant.latestReview && (
        <section className="mt-4 overflow-hidden rounded-xl border border-line bg-card">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
              Latest review
            </p>
            <span className="text-xs font-medium text-muted">
              {formatDate(restaurant.latestReview.createdAt)}
            </span>
          </div>
          <div className="px-5 py-5">
            <Stars rating={restaurant.latestReview.rating} />
            <p className="mt-3 text-[17px] leading-[1.6] text-ink">
              {restaurant.latestReview.comment}
            </p>
          </div>
        </section>
      )}

      {/* Section 4 — older voices, back on the page itself. */}
      {restaurant.reviews.length > 0 && (
        <section className="mt-10">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
            Earlier reviews
          </h2>
          <ul className="mt-2 divide-y divide-line">
            {restaurant.reviews.map((review) => (
              <li key={review.id} className="py-6">
                <div className="flex items-center justify-between gap-4">
                  <Stars rating={review.rating} size="h-3 w-3" />
                  <span className="text-xs font-medium text-muted">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                <p className="mt-2.5 text-[15px] leading-[1.65] text-ink">
                  {review.comment}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasReviews && (
        <section className="rounded-xl border border-line bg-card px-6 py-10 text-center">
          <p className="text-[17px] font-semibold text-ink">No reviews yet.</p>
          <p className="mx-auto mt-2 max-w-[32ch] text-sm leading-relaxed text-muted">
            Be the first to say how it went.
          </p>
          <div className="mt-7">
            <Link
              href={`/review/${id}`}
              className="inline-flex h-11 items-center rounded-lg bg-ink px-5 text-sm font-medium text-paper transition-colors hover:bg-[#2c2a22]"
            >
              Write the first review
            </Link>
          </div>
        </section>
      )}

      {hasReviews && (
        <div className="mt-10">
          <Link
            href={`/review/${id}`}
            className="inline-flex h-11 items-center rounded-lg bg-ink px-5 text-sm font-medium text-paper transition-colors hover:bg-[#2c2a22]"
          >
            Write a review
          </Link>
        </div>
      )}
    </main>
  );
}
