import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { RatingSummary, Stars } from '../ui/Rating';
import { Avatar } from '../ui/Avatar';
import { EmptyState } from '../ui/EmptyState';
import { timeAgo } from '../../utils/format';
import { MessageSquareQuote } from 'lucide-react';

export const CaptainReviewsTab: React.FC = () => {
  const { currentCaptain, reviews, loadReviews, language } = useApp();
  const captainId = currentCaptain?.id;
  useEffect(() => {
    if (captainId) loadReviews(captainId).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [captainId]);
  if (!currentCaptain) return null;

  const myReviews = reviews.filter((r) => r.captainId === currentCaptain.id);

  if (myReviews.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquareQuote className="w-7 h-7" />}
        tone="accent"
        title="No reviews yet"
        body="After you finish a job, ask the customer to find you on HomeServ and leave a review — reviews help you rank higher."
      />
    );
  }

  return (
    <div className="grid lg:grid-cols-[20rem_minmax(0,1fr)] gap-4 sm:gap-5 items-start">
      <div className="lg:sticky lg:top-24 space-y-3">
        <RatingSummary rating={currentCaptain.rating} count={currentCaptain.reviewCount} reviews={myReviews} />
        <p className="text-[13px] text-ink-3 px-1">What customers are saying about you. Great reviews move you up in search results.</p>
      </div>
      <ul className="space-y-3">
        {myReviews.map((r) => (
          <li key={r.id} className="card p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <Avatar name={r.customerName} className="w-10 h-10 rounded-full" textClassName="text-sm" />
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-ink truncate">{r.customerName}</p>
                <p className="text-xs text-ink-3">{timeAgo(r.date, language)}</p>
              </div>
              <Stars value={r.rating} className="w-4 h-4" />
            </div>
            {r.comment && <p className="mt-3 text-[15px] text-ink-2 leading-relaxed">{r.comment}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
};
