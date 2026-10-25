import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Never serve a cached copy of this page: the average must be fresh every time.
export const dynamic = "force-dynamic";

type ReviewRow = {
  id: number;
  rating: number;
  comment: string;
  created_at: string | Date;
};

// The shape of one review in the response, matching what the screen needs.
function toReview(row: ReviewRow) {
  return {
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

// GET /api/restaurants/[id]
// Everything the restaurant screen needs, already computed and already ordered,
// so the frontend has nothing left to figure out.
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const restaurantId = Number(id);

  if (!Number.isInteger(restaurantId)) {
    return NextResponse.json(
      { error: "That restaurant does not exist." },
      { status: 404 }
    );
  }

  const sql = getDb();

  const restaurants = await sql`
    SELECT id, name, cuisine, area FROM restaurants WHERE id = ${restaurantId}
  `;

  if (restaurants.length === 0) {
    return NextResponse.json(
      { error: "That restaurant does not exist." },
      { status: 404 }
    );
  }

  const restaurant = restaurants[0];

  // The entire intelligence of the product. Note that nothing here is stored:
  // AVG and COUNT are recalculated on every request.
  const totals = await sql`
    SELECT COUNT(*)::int AS total_reviews,
           ROUND(AVG(rating)::numeric, 1) AS average_rating
    FROM reviews
    WHERE restaurant_id = ${restaurantId}
  `;

  const rows = (await sql`
    SELECT id, rating, comment, created_at
    FROM reviews
    WHERE restaurant_id = ${restaurantId}
    ORDER BY created_at DESC, id DESC
  `) as ReviewRow[];

  // Newest first, so the first row is the latest review and the rest are the
  // older ones. Splitting here is why no review is printed twice.
  const [latest, ...older] = rows;

  return NextResponse.json({
    name: restaurant.name,
    cuisine: restaurant.cuisine,
    area: restaurant.area,
    // Postgres hands NUMERIC back as text ("4.3"), so convert it to a number.
    // With no reviews, AVG is NULL and we pass NULL through unchanged.
    averageRating:
      totals[0].average_rating === null ? null : Number(totals[0].average_rating),
    totalReviews: totals[0].total_reviews,
    latestReview: latest ? toReview(latest) : null,
    reviews: older.map(toReview),
  });
}
