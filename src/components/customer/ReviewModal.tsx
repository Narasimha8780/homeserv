import React, { useState } from 'react';
import type { Captain } from '../../types';
import { useApp } from '../../context/AppContext';
import { Star, X, ThumbsUp } from 'lucide-react';

export const ReviewModal: React.FC<{
  captain: Captain | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ captain, isOpen, onClose }) => {
  const { submitReview, t } = useApp();
  const [name, setName] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !captain) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim() || isSubmitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitReview(captain.id, name, rating, comment);
      setName('');
      setComment('');
      setRating(5);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[1.75rem] w-full max-w-md shadow-premium-lg overflow-hidden border border-white/60">
        <div className="relative overflow-hidden p-4 bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-between">
          <div className="absolute inset-0 mesh-bg-amber opacity-40 pointer-events-none" />
          <div className="relative flex items-center space-x-2">
            <ThumbsUp className="w-5 h-5" />
            <h3 className="font-extrabold text-base">{t('writeReview')}</h3>
          </div>
          <button onClick={onClose} className="relative p-1.5 rounded-full hover:bg-white/20 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="text-center space-y-1">
            <h4 className="font-bold text-slate-900 text-sm">How was your experience with {captain.name}?</h4>
          </div>

          <div className="flex justify-center items-center space-x-2 py-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1.5 transition-transform hover:scale-125 focus:outline-none"
              >
                <Star
                  className={`w-9 h-9 ${
                    (hoverRating || rating) >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-100'
                  }`}
                />
              </button>
            ))}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Your name</label>
            <input
              type="text"
              required
              placeholder="e.g. Priya Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm p-3 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Your review</label>
            <textarea
              required
              rows={3}
              placeholder="Tell others about the quality, punctuality, and behaviour..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full text-xs p-3 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
            />
          </div>

          {error && <p className="text-xs text-rose-600 font-semibold text-center">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-[0_8px_24px_-6px_rgba(37,99,235,0.5)] hover:shadow-[0_10px_30px_-6px_rgba(37,99,235,0.6)] hover-lift active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : t('submitReview')}
          </button>
        </form>
      </div>
    </div>
  );
};
