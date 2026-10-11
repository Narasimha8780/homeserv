import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sheet, SheetBody, SheetFooter, SheetHeader } from '../ui/Sheet';
import { Avatar } from '../ui/Avatar';
import { Star, PenLine } from 'lucide-react';

const RATING_LABELS = ['', 'Poor', 'Below average', 'Okay', 'Good', 'Excellent!'];
const QUICK_TAGS = ['On time', 'Fair price', 'Polite', 'Quality work', 'Clean & tidy', 'Would hire again'];

export const ReviewSheet: React.FC<{ captainId: string | null; onClose: () => void }> = ({ captainId, onClose }) => {
  const { captains, submitReview, currentCustomer, t } = useApp();
  const captain = captains.find((c) => c.id === captainId) || null;

  // Remounted per captain (keyed by the parent), so initial state is a fresh form.
  const [name, setName] = useState(() => currentCustomer?.name || '');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!captain) return null;

  const toggleTag = (tag: string) => {
    setComment((prev) => {
      const parts = prev.split(/\.\s*/).map((p) => p.trim()).filter(Boolean);
      return parts.includes(tag) ? parts.filter((p) => p !== tag).join('. ') : [...parts, tag].join('. ');
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim() || isSubmitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitReview(captain.id, name.trim(), rating, comment.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const shown = hoverRating || rating;

  return (
    <Sheet open={!!captain} onClose={onClose} label={t('writeReview')}>
      <SheetHeader title={t('writeReview')} icon={<PenLine className="w-5 h-5" />} onClose={onClose} />
      <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
        <SheetBody className="px-5 pb-4 space-y-5">
          <div className="flex items-center gap-3 rounded-2xl bg-surface-2 border border-line p-3">
            <Avatar src={captain.avatar} name={captain.name} className="w-11 h-11 rounded-xl" />
            <p className="text-sm text-ink-2">
              How was your experience with <span className="font-semibold text-ink">{captain.name}</span>?
            </p>
          </div>

          <div className="text-center">
            <div className="flex justify-center gap-1.5" onMouseLeave={() => setHoverRating(0)} role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  role="radio"
                  aria-checked={rating === star}
                  aria-label={`${star} star${star > 1 ? 's' : ''}`}
                  onMouseEnter={() => setHoverRating(star)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110 active:scale-90"
                >
                  <Star className={`w-10 h-10 transition-colors ${shown >= star ? 'fill-star text-star' : 'fill-transparent text-ink-3/50'}`} />
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-sm font-semibold text-accent-ink h-5">{RATING_LABELS[shown]}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {QUICK_TAGS.map((tag) => (
              <button type="button" key={tag} onClick={() => toggleTag(tag)} aria-pressed={comment.includes(tag)} className="chip">
                {tag}
              </button>
            ))}
          </div>

          <div>
            <label className="field-label" htmlFor="review-comment">Your review</label>
            <textarea
              id="review-comment"
              required
              rows={3}
              placeholder="Tell others about the quality, punctuality and behaviour…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="input resize-none"
            />
          </div>

          <div>
            <label className="field-label" htmlFor="review-name">Your name</label>
            <input id="review-name" required placeholder="e.g. Priya Sharma" value={name} onChange={(e) => setName(e.target.value)} className="input" />
          </div>

          {error && <p className="text-sm text-danger-ink font-semibold text-center">{error}</p>}
        </SheetBody>
        <SheetFooter>
          <button type="submit" disabled={isSubmitting || !comment.trim() || !name.trim()} className="btn btn-primary w-full h-[3.25rem] text-[15px]">
            {isSubmitting ? 'Submitting…' : t('submitReview')}
          </button>
        </SheetFooter>
      </form>
    </Sheet>
  );
};
