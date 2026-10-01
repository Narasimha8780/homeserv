import React from 'react';
import type { Captain, ServiceCategory } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Star,
  MapPin,
  ShieldCheck,
  Phone,
  MessageCircle,
  Heart,
  Clock,
  Zap,
  Wrench,
  Car,
  Hammer,
  Paintbrush,
  Fan,
  Tv,
  ShieldAlert,
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Zap, Wrench, Car, Hammer, Paintbrush, Fan, Tv, ShieldAlert,
};

export const CaptainCard: React.FC<{
  captain: Captain;
  categories: ServiceCategory[];
  onOpenProfile: (captain: Captain) => void;
}> = ({ captain, categories, onOpenProfile }) => {
  const { isFavorite, toggleFavorite, recordContactClick, t } = useApp();
  const favorite = isFavorite(captain.id);

  const primaryCategory = categories.find((c) => c.id === captain.categories[0]);
  const PrimaryIcon = CATEGORY_ICONS[primaryCategory?.iconName || ''] || Wrench;

  const categoryTitles = captain.categories
    .map((id) => categories.find((c) => c.id === id)?.title)
    .filter(Boolean)
    .join(' • ');

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    recordContactClick(captain.id);
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    recordContactClick(captain.id);
  };

  return (
    <div
      onClick={() => onOpenProfile(captain)}
      className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 shadow-sm hover:shadow-lg transition-all duration-200 p-4 flex flex-col gap-3 cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <img
            src={captain.avatar}
            alt={captain.name}
            className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
          />
          {primaryCategory && (
            <span
              className={`absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-gradient-to-br ${primaryCategory.color} text-white flex items-center justify-center border-2 border-white shadow-sm`}
            >
              <PrimaryIcon className="w-3 h-3" />
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-slate-900 text-sm truncate">{captain.name}</h3>
                {captain.kycStatus === 'verified' && (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                )}
              </div>
              <p className="text-xs text-blue-700 font-semibold truncate">{categoryTitles}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(captain.id);
              }}
              className={`shrink-0 p-1.5 rounded-full transition-colors ${
                favorite ? 'text-rose-500 bg-rose-50' : 'text-slate-300 hover:text-rose-400'
              }`}
              aria-label={favorite ? t('removeFromFavorites') : t('addToFavorites')}
            >
              <Heart className={`w-4 h-4 ${favorite ? 'fill-rose-500' : ''}`} />
            </button>
          </div>

          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1.5 text-[11px] text-slate-500">
            {captain.rating > 0 ? (
              <span className="flex items-center gap-1 font-bold text-amber-600">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {captain.rating.toFixed(1)} ({captain.reviewCount})
              </span>
            ) : (
              <span className="text-slate-400">New</span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {captain.experienceYears} yrs exp
            </span>
            <span className="flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              {captain.areas.slice(0, 2).join(', ')}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <a
          href={`tel:${captain.phone}`}
          onClick={handleCall}
          className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-2.5 rounded-xl shadow-xs transition-colors"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>{t('callNow')}</span>
        </a>
        <a
          href={`https://wa.me/${captain.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleWhatsApp}
          className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-2.5 rounded-xl shadow-xs transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>{t('whatsapp')}</span>
        </a>
      </div>
    </div>
  );
};
