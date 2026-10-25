import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// POST /api/reviews
// Saves exactly one review. Validates in this order and stops at the first
// failure: rating, then comment, then "does this restaurant exist".
export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Send a JSON body with restaurantId, rating and comment." },
      { status: 400 }
    );
  }

  const { restaurantId, rating, comment } = (body ?? {}) as {
    restaurantId?: unknown;
    rating?: unknown;
    comment?: unknown;
  };

  // 1. Rating must be a whole number from 1 to 5.
  //    typeof catches "4" (a string) and null; Number.isInteger catches 4.5.
  if (
    typeof rating !== "number" ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return NextResponse.json(
      { error: "Rating must be a whole number between 1 and 5." },
      { status: 400 }
    );
  }

  // 2. Comment must be a non-empty string after trimming whitespace.
  if (typeof comment !== "string" || comment.trim().length === 0) {
    return NextResponse.json(
      { error: "Comment cannot be empty." },
      { status: 400 }
    );
  }

  // 3. The restaurant must actually exist - this one is a database lookup.
  //    Anything that is not a whole number cannot be an existing id, so it is
  //    rejected here too rather than reaching the database and erroring.
  if (!Number.isInteger(restaurantId)) {
    return NextResponse.json(
      { error: "That restaurant does not exist." },
      { status: 400 }
    );
  }

  const id = restaurantId as number;
  const sql = getDb();

  const restaurant = await sql`
    SELECT id FROM restaurants WHERE id = ${id}
  `;

  if (restaurant.length === 0) {
    return NextResponse.json(
      { error: "That restaurant does not exist." },
      { status: 400 }
    );
  }

  // One row in, one row out. Nothing else in the database changes.
  const inserted = await sql`
    INSERT INTO reviews (restaurant_id, rating, comment)
    VALUES (${id}, ${rating}, ${comment.trim()})
    RETURNING id
  `;

  return NextResponse.json(
    { success: true, reviewId: inserted[0].id },
    { status: 201 }
  );
}
