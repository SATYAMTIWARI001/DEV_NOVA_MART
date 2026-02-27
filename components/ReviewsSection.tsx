'use client';

import { Star, ThumbsUp, CheckCircle } from 'lucide-react';
import { Review } from '@/lib/types';

interface ReviewsSectionProps {
  reviews: Review[];
  rating: number;
  reviewCount: number;
}

export function ReviewsSection({ reviews, rating, reviewCount }: ReviewsSectionProps) {
  // Calculate rating distribution
  const distribution = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(r => r.rating === star).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { star, count, percentage };
  });

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="flex gap-8 items-start">
        {/* Overall rating */}
        <div className="text-center">
          <div className="text-5xl font-bold">{rating.toFixed(1)}</div>
          <div className="flex items-center justify-center gap-1 mt-1">
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= Math.round(rating)
                    ? 'fill-warning text-warning'
                    : 'fill-muted text-muted'
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {reviewCount.toLocaleString()} reviews
          </div>
        </div>

        {/* Rating distribution */}
        <div className="flex-1 space-y-2">
          {distribution.map(({ star, count, percentage }) => (
            <div key={star} className="flex items-center gap-2">
              <span className="text-sm w-4">{star}</span>
              <Star className="h-3 w-3 fill-warning text-warning" />
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-warning rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-8">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        <h4 className="font-semibold">Customer Reviews</h4>
        
        {reviews.length === 0 ? (
          <p className="text-muted-foreground text-sm">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.slice(0, 5).map(review => (
              <div key={review.id} className="p-4 rounded-xl bg-muted/50 border">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{review.userName}</span>
                      {review.verified && (
                        <span className="flex items-center gap-1 text-xs text-success">
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${
                            star <= review.rating
                              ? 'fill-warning text-warning'
                              : 'fill-muted text-muted'
                          }`}
                        />
                      ))}
                      <span className="text-xs text-muted-foreground ml-2">
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <h5 className="font-medium mt-2">{review.title}</h5>
                <p className="text-sm text-muted-foreground mt-1">{review.content}</p>
                
                <div className="flex items-center gap-2 mt-3">
                  <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <ThumbsUp className="h-3 w-3" />
                    Helpful ({review.helpful})
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
