import { Star, UserRound } from "lucide-react";
import type { ProductReview } from "@/src/data/products";

type ProductReviewsProps = {
  reviews: ProductReview[];
};

export function ProductReviews({ reviews }: ProductReviewsProps) {
  return (
    <section className="bg-bhor-surface px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1512px]">
        <div className="flex flex-col justify-between gap-4 border-b border-bhor-border pb-5 md:flex-row md:items-end">
          <div>
            <p className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-gold">
              Customer Stories
            </p>
            <h2 className="mt-1 font-bhor-display text-bhor-h2-mobile font-bhor-semibold text-bhor-text md:text-bhor-h2">
              Reviews
            </h2>
          </div>
          <div className="flex items-center gap-2 text-bhor-small font-bhor-semibold text-bhor-text">
            <span className="flex text-bhor-gold" aria-hidden>
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="h-4 w-4 fill-current" />
              ))}
            </span>
            {reviews.length > 0 ? `${reviews.length} customer reviews` : "New launch"}
          </div>
        </div>

        {reviews.length > 0 ? (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {reviews.map((review) => (
              <article
                key={`${review.customerName}-${review.content}`}
                className="rounded-bhor-md border border-bhor-border bg-bhor-cream p-5 shadow-bhor-soft"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-bhor-primary-soft text-bhor-primary">
                    <UserRound className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <p className="font-bhor-semibold text-bhor-text">{review.customerName}</p>
                    {review.verified ? (
                      <p className="text-bhor-caption font-bhor-semibold text-bhor-success">
                        Verified purchase
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="mt-4 flex text-bhor-gold" aria-label={`${review.rating} star review`}>
                  {Array.from({ length: review.rating }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-3 text-bhor-small leading-bhor-body text-bhor-text-muted">
                  {review.content}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6 grid gap-5 rounded-bhor-lg border border-bhor-border bg-bhor-cream p-6 shadow-bhor-soft md:grid-cols-[40%_60%] md:p-8">
            <div>
              <p className="font-bhor-display text-bhor-h3-mobile font-bhor-semibold text-bhor-text md:text-bhor-h3">
                Be one of the first to experience BHORKIT.
              </p>
              <p className="mt-3 text-bhor-small leading-bhor-body text-bhor-text-muted">
                Reviews will appear here after real customer orders and verified feedback.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {["Thoughtful curation", "Premium packaging", "Patna delivery"].map((label) => (
                <div key={label} className="rounded-bhor-md border border-bhor-border bg-bhor-surface p-4">
                  <Star className="h-5 w-5 text-bhor-gold" aria-hidden />
                  <p className="mt-3 text-bhor-small font-bhor-semibold text-bhor-text">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
