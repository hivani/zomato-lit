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

function ReviewBody({ review }: { review: Review }) {
  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <Stars rating={review.rating} />
        <span className="text-xs text-muted">{formatDate(review.createdAt)}</span>
      </div>
      <p className="mt-3 text-[15px] leading-relaxed">{review.comment}</p>
    </>
  );
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
      <main className="mx-auto w-full max-w-[560px] px-6 py-16">
        <p className="text-sm text-accent">{error}</p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm text-muted underline underline-offset-4"
        >
          Go back
        </Link>
      </main>
    );
  }

  if (!restaurant) {
    return (
      <main className="mx-auto w-full max-w-[560px] px-6 py-16">
        <p className="text-sm text-muted">Loading…</p>
      </main>
    );
  }

  const hasReviews = restaurant.totalReviews > 0;

  return (
    <main className="mx-auto w-full max-w-[560px] px-6 py-14 sm:py-20">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {restaurant.name}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {restaurant.cuisine} · {restaurant.area}
        </p>
      </header>

      <section className="mt-10">
        {hasReviews ? (
          <div className="flex items-end gap-3">
            {/*
              This is the line. The average is printed exactly as the API sent
              it. There is no addition, division, rounding or sorting in this
              file - only this variable being placed on the screen.
            */}
            <span className="text-7xl font-semibold leading-none tracking-tighter">
              {restaurant.averageRating}
            </span>
            <span className="pb-1.5 text-sm text-muted">
              {restaurant.totalReviews}{" "}
              {restaurant.totalReviews === 1 ? "review" : "reviews"}
            </span>
          </div>
        ) : (
          <p className="text-sm text-muted">No ratings yet.</p>
        )}
      </section>

      {!hasReviews && (
        <section className="mt-10 rounded-xl border border-line bg-card p-6">
          <p className="text-[15px]">No reviews yet.</p>
          <p className="mt-1 text-sm text-muted">
            Be the first to say how it went.
          </p>
          <Link
            href={`/review/${id}`}
            className="mt-6 inline-block rounded-lg border border-ink/15 px-5 py-2.5 text-sm transition-colors hover:border-ink/40"
          >
            Write the first review
          </Link>
        </section>
      )}

      {restaurant.latestReview && (
        <section className="mt-10 rounded-xl border border-line bg-card p-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-accent">
            Latest review
          </p>
          <div className="mt-4">
            <ReviewBody review={restaurant.latestReview} />
          </div>
        </section>
      )}

      {restaurant.reviews.length > 0 && (
        <section className="mt-10">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
            Earlier reviews
          </h2>
          <ul className="mt-4 divide-y divide-line border-t border-line">
            {restaurant.reviews.map((review) => (
              <li key={review.id} className="py-5">
                <ReviewBody review={review} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {hasReviews && (
        <div className="mt-12">
          <Link
            href={`/review/${id}`}
            className="inline-block rounded-lg border border-ink/15 px-5 py-2.5 text-sm transition-colors hover:border-ink/40"
          >
            Write a review
          </Link>
        </div>
      )}
    </main>
  );
}
