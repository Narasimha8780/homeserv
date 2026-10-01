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

  if (!isOpen || !captain) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;
    submitReview(captain.id, name, rating, comment);
    setName('');
    setComment('');
    setRating(5);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ThumbsUp className="w-5 h-5" />
            <h3 className="font-extrabold text-base">{t('writeReview')}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 text-white">
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
            <label className="text-xs font-bold text-slate-700 block mb-1">Your name</label>
            <input
              type="text"
              required
              placeholder="e.g. Priya Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Your review</label>
            <textarea
              required
              rows={3}
              placeholder="Tell others about the quality, punctuality, and behaviour..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-2xl focus:bg-white focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-lg transition-transform active:scale-95"
          >
            {t('submitReview')}
          </button>
        </form>
      </div>
    </div>
  );
};
