import React from 'react';
import { Star } from 'lucide-react';
import type { Review } from '../../types';
import { useApp } from '../../context/AppContext';

export const Stars: React.FC<{ value: number; className?: string }> = ({ value, className = 'w-3.5 h-3.5' }) => (
  <span className="inline-flex items-center gap-0.5" aria-label={`${value.toFixed(1)} out of 5`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        className={`${className} ${value >= i - 0.25 ? 'fill-star text-star' : 'fill-transparent text-ink-3/50'}`}
      />
    ))}
  </span>
);

export const RatingPill: React.FC<{ rating: number; count: number }> = ({ rating, count }) => {
  const { t } = useApp();
  if (rating <= 0) {
    return <span className="pill bg-info-soft text-info-ink">{t('newListing')}</span>;
  }
  return (
    <span className="pill bg-warn-soft text-warn-ink">
      <Star className="w-3.5 h-3.5 fill-star text-star" />
      <span className="font-bold">{rating.toFixed(1)}</span>
      <span className="text-ink-3 font-medium">({count})</span>
    </span>
  );
};

// Big average + per-star distribution bars, used on profiles and the captain dashboard.
export const RatingSummary: React.FC<{ rating: number; count: number; reviews: Review[] }> = ({ rating, count, reviews }) => {
  const { t } = useApp();
  const buckets = [5, 4, 3, 2, 1].map((star) => ({
    star,
    n: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));
  const max = Math.max(1, ...buckets.map((b) => b.n));
  return (
    <div className="flex items-center gap-5 rounded-2xl bg-surface-2 border border-line p-4">
      <div className="text-center shrink-0 w-20">
        <div className="font-display text-4xl font-bold text-ink leading-none">{rating > 0 ? rating.toFixed(1) : '—'}</div>
        <div className="mt-1.5 flex justify-center">
          <Stars value={rating} className="w-3 h-3" />
        </div>
        <div className="mt-1 text-[11px] text-ink-3">
          {count} {t('reviews').toLowerCase()}
        </div>
      </div>
      <div className="flex-1 space-y-1.5">
        {buckets.map((b) => (
          <div key={b.star} className="flex items-center gap-2 text-[11px] text-ink-3">
            <span className="w-2 font-semibold">{b.star}</span>
            <div className="flex-1 h-1.5 rounded-full bg-surface-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-500"
                style={{ width: `${(b.n / max) * 100}%` }}
              />
            </div>
            <span className="w-3 text-right">{b.n}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
