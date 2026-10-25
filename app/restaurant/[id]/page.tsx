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
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-accent">
          Not found
        </p>
        <h1 className="mt-3 text-[1.75rem] font-semibold leading-snug tracking-[-0.02em]">
          {error}
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

  if (!restaurant) {
    return (
      <main className="mx-auto w-full max-w-[560px] px-6 py-12 sm:py-16">
        <div className="animate-pulse space-y-3">
          <div className="h-9 w-3/4 rounded bg-ink/[0.07]" />
          <div className="h-4 w-1/3 rounded bg-ink/[0.05]" />
        </div>
        <div className="mt-12 h-16 w-36 animate-pulse rounded bg-ink/[0.07]" />
        <div className="mt-12 h-36 animate-pulse rounded-xl bg-ink/[0.04]" />
      </main>
    );
  }

  const hasReviews = restaurant.totalReviews > 0;

  return (
    <main className="mx-auto w-full max-w-[560px] px-6 py-12 sm:py-16">
      <header className="border-b border-line pb-8">
        <h1 className="text-balance text-[2rem] font-semibold leading-[1.1] tracking-[-0.025em] sm:text-[2.5rem]">
          {restaurant.name}
        </h1>
        <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-muted">
          {restaurant.cuisine} · {restaurant.area}
        </p>
      </header>

      {hasReviews && (
        <section className="mt-10 flex items-baseline gap-4">
          {/*
            This is the line. The average is printed exactly as the API sent it.
            There is no addition, division, rounding or sorting in this file.
          */}
          <span className="text-[4.5rem] font-semibold leading-[0.8] tracking-[-0.045em] tabular-nums sm:text-[5.5rem]">
            {restaurant.averageRating}
          </span>
          <span className="pb-1 text-sm text-muted">
            {restaurant.totalReviews}{" "}
            {restaurant.totalReviews === 1 ? "review" : "reviews"}
          </span>
        </section>
      )}

      {restaurant.latestReview && (
        <section className="mt-10 overflow-hidden rounded-xl border border-line bg-card">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-accent">
              Latest review
            </p>
            <span className="text-xs text-muted">
              {formatDate(restaurant.latestReview.createdAt)}
            </span>
          </div>
          <div className="px-5 py-5">
            <Stars rating={restaurant.latestReview.rating} />
            <p className="mt-3 text-[17px] leading-[1.6]">
              {restaurant.latestReview.comment}
            </p>
          </div>
        </section>
      )}

      {restaurant.reviews.length > 0 && (
        <section className="mt-12">
          <h2 className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
            Earlier reviews
          </h2>
          <ul className="mt-2 divide-y divide-line">
            {restaurant.reviews.map((review) => (
              <li key={review.id} className="py-6">
                <div className="flex items-center justify-between gap-4">
                  <Stars rating={review.rating} size="h-3 w-3" />
                  <span className="text-xs text-muted">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                <p className="mt-2.5 text-[15px] leading-[1.65]">
                  {review.comment}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasReviews && (
        <section className="mt-10 rounded-xl border border-dashed border-line bg-card px-6 py-10 text-center">
          <p className="text-[17px] font-medium">No reviews yet.</p>
          <p className="mx-auto mt-2 max-w-[32ch] text-sm leading-relaxed text-muted">
            Be the first to say how it went.
          </p>
          <div className="mt-7">
            <Link
              href={`/review/${id}`}
              className="inline-flex h-11 items-center rounded-lg bg-ink px-5 text-sm font-medium text-paper transition-colors hover:bg-[#26261f]"
            >
              Write the first review
            </Link>
          </div>
        </section>
      )}

      {hasReviews && (
        <div className="mt-12">
          <Link
            href={`/review/${id}`}
            className="inline-flex h-11 items-center rounded-lg border border-ink/15 px-5 text-sm font-medium transition-colors hover:border-ink/30 hover:bg-ink/[0.03]"
          >
            Write a review
          </Link>
        </div>
      )}
    </main>
  );
}
