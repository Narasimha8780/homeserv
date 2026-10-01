import React, { useEffect } from 'react';
import type { Captain } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  X,
  Star,
  ShieldCheck,
  MapPin,
  Phone,
  MessageCircle,
  Heart,
  Languages,
  Clock,
  Eye,
} from 'lucide-react';

export const CaptainProfileModal: React.FC<{
  captain: Captain | null;
  isOpen: boolean;
  onClose: () => void;
  onWriteReview: (captain: Captain) => void;
}> = ({ captain, isOpen, onClose, onWriteReview }) => {
  const { categories, reviews, isFavorite, toggleFavorite, recordContactClick, recordProfileView, t } = useApp();

  useEffect(() => {
    if (isOpen && captain) {
      recordProfileView(captain.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, captain?.id]);

  if (!isOpen || !captain) return null;

  const favorite = isFavorite(captain.id);
  const captainReviews = reviews.filter((r) => r.captainId === captain.id);
  const categoryTitles = captain.categories
    .map((id) => categories.find((c) => c.id === id)?.title)
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        <div className="relative bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <img
              src={captain.avatar}
              alt={captain.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-white/40"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-lg font-black leading-tight">{captain.name}</h2>
                {captain.kycStatus === 'verified' && (
                  <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300/30">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-100 mt-0.5">{categoryTitles.join(' • ')}</p>
              <div className="flex items-center gap-3 mt-1.5 text-xs">
                {captain.rating > 0 ? (
                  <span className="flex items-center gap-1 font-bold text-amber-300">
                    <Star className="w-3.5 h-3.5 fill-amber-300" />
                    {captain.rating.toFixed(1)} ({captain.reviewCount})
                  </span>
                ) : (
                  <span className="text-blue-200">New listing</span>
                )}
                <span className="flex items-center gap-1 text-blue-200">
                  <Clock className="w-3.5 h-3.5" />
                  {captain.experienceYears} yrs exp
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-5">
          <p className="text-sm text-slate-700 leading-relaxed">{captain.bio}</p>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 rounded-xl p-3 flex items-start gap-2">
              <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <span className="block text-slate-400">Serves</span>
                <span className="font-semibold text-slate-800">{captain.areas.join(', ')}</span>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 flex items-start gap-2">
              <Languages className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <span className="block text-slate-400">Languages</span>
                <span className="font-semibold text-slate-800">{captain.languages.join(', ')}</span>
              </div>
            </div>
            {captain.startingPrice != null && (
              <div className="bg-slate-50 rounded-xl p-3 flex items-start gap-2 col-span-2">
                <span className="text-slate-400 text-xs shrink-0 mt-0.5">Starting from</span>
                <span className="font-bold text-slate-900">₹{captain.startingPrice}</span>
                <span className="text-[10px] text-slate-400">(discuss final price directly with {captain.name.split(' ')[0]})</span>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Reviews ({captainReviews.length})
              </h3>
              <button
                onClick={() => onWriteReview(captain)}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                {t('writeReview')}
              </button>
            </div>
            {captainReviews.length === 0 ? (
              <p className="text-xs text-slate-400 bg-slate-50 rounded-xl p-3.5">No reviews yet — be the first.</p>
            ) : (
              <div className="space-y-2.5">
                {captainReviews.map((r) => (
                  <div key={r.id} className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{r.customerName}</span>
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {r.rating}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{r.comment}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">{r.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Eye className="w-3.5 h-3.5" />
            <span>{captain.profileViews} people viewed this profile</span>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-2 shrink-0">
          <button
            onClick={() => toggleFavorite(captain.id)}
            className={`p-3 rounded-2xl border transition-colors ${
              favorite ? 'bg-rose-50 border-rose-200 text-rose-500' : 'bg-white border-slate-200 text-slate-400'
            }`}
            aria-label={favorite ? t('removeFromFavorites') : t('addToFavorites')}
          >
            <Heart className={`w-5 h-5 ${favorite ? 'fill-rose-500' : ''}`} />
          </button>
          <a
            href={`tel:${captain.phone}`}
            onClick={() => recordContactClick(captain.id)}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm px-4 py-3 rounded-2xl shadow-md transition-transform active:scale-95"
          >
            <Phone className="w-4 h-4" />
            <span>{t('callNow')}</span>
          </a>
          <a
            href={`https://wa.me/${captain.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => recordContactClick(captain.id)}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm px-4 py-3 rounded-2xl shadow-md transition-transform active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{t('whatsapp')}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
