import React from 'react';
import { useApp } from '../../context/AppContext';
import { Star, MessageSquareQuote } from 'lucide-react';

export const CaptainReviewsTab: React.FC = () => {
  const { currentCaptain, reviews } = useApp();
  if (!currentCaptain) return null;

  const myReviews = reviews.filter((r) => r.captainId === currentCaptain.id);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black text-slate-900">Reviews Received</h2>
          <p className="text-xs text-slate-500">What customers are saying about you</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-slate-900 flex items-center gap-1">
            {currentCaptain.rating > 0 ? currentCaptain.rating.toFixed(2) : '—'}
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          </span>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">{currentCaptain.reviewCount} reviews</span>
        </div>
      </div>

      {myReviews.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-xs">
          <MessageSquareQuote className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="font-bold text-slate-700 text-sm">No reviews yet</h4>
          <p className="text-xs text-slate-400 mt-1">Reviews from customers you've worked with will show up here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myReviews.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{r.customerName}</span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {r.rating}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1.5">{r.comment}</p>
              <span className="text-[10px] text-slate-400 mt-1 block">{r.date}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
