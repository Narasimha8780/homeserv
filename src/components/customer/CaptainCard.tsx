import React from 'react';
import type { Captain, ServiceCategory } from '../../types';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../ui/Avatar';
import { RatingPill } from '../ui/Rating';
import { WhatsAppIcon } from '../ui/WhatsAppIcon';
import { formatPrice, telLink, whatsappGreeting, whatsappLink } from '../../utils/format';
import { BadgeCheck, MapPin, Phone, Heart, Briefcase } from 'lucide-react';

export const CaptainCard: React.FC<{
  captain: Captain;
  categories: ServiceCategory[];
  onOpenProfile: (captain: Captain) => void;
}> = ({ captain, categories, onOpenProfile }) => {
  const { isFavorite, toggleFavorite, recordContactClick, t } = useApp();
  const favorite = isFavorite(captain.id);

  const titles = captain.categories.map((id) => categories.find((c) => c.id === id)?.title).filter(Boolean) as string[];
  const areaText =
    captain.areas.length > 1 ? `${captain.areas[0]} +${captain.areas.length - 1}` : captain.areas[0] || '';

  const stop = (e: React.SyntheticEvent) => e.stopPropagation();
  const open = () => onOpenProfile(captain);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          open();
        }
      }}
      aria-label={`${captain.name}, ${titles.join(', ')}`}
      className="card card-interactive p-4 flex flex-col gap-4 outline-none"
    >
      <div className="flex gap-3.5">
        <div className="relative shrink-0 self-start">
          <Avatar src={captain.avatar} name={captain.name} className="w-16 h-16 rounded-2xl" textClassName="text-xl" />
          <span
            className={`absolute -bottom-1 -right-1 w-[18px] h-[18px] rounded-full border-[3px] border-[var(--surface-solid)] ${
              captain.isAvailable ? 'bg-success' : 'bg-ink-3'
            }`}
            title={captain.isAvailable ? t('available') : t('busy')}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="flex items-center gap-1 text-[16px] font-bold text-ink leading-snug">
                <span className="truncate">{captain.name}</span>
                {captain.kycStatus === 'verified' && (
                  <BadgeCheck className="w-[18px] h-[18px] text-info-ink shrink-0" aria-label={t('verified')} />
                )}
              </h3>
              <p className="text-[13px] font-semibold text-accent-ink truncate">{titles.join(' · ')}</p>
            </div>
            <button
              onClick={(e) => {
                stop(e);
                toggleFavorite(captain.id);
              }}
              aria-pressed={favorite}
              aria-label={favorite ? t('removeFromFavorites') : t('addToFavorites')}
              className={`icon-btn w-9 h-9 -mt-1 -mr-1 ${favorite ? '!text-rose-500 !bg-rose-500/12 !border-rose-500/30' : ''}`}
            >
              <Heart className={`w-[18px] h-[18px] ${favorite ? 'fill-rose-500' : ''}`} />
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <RatingPill rating={captain.rating} count={captain.reviewCount} />
            <span className="pill">
              <Briefcase className="w-3.5 h-3.5" />
              {captain.experienceYears} {t('yrs')}
            </span>
            {areaText && (
              <span className="pill max-w-[11rem]">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{areaText}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-3.5 border-t border-line">
        <div className="mr-auto min-w-0 leading-tight">
          {captain.startingPrice != null ? (
            <>
              <span className="block text-[11px] font-medium text-ink-3">{t('from')}</span>
              <span className="font-display text-lg font-bold text-ink">{formatPrice(captain.startingPrice)}</span>
            </>
          ) : (
            <span className={`text-[13px] font-semibold ${captain.isAvailable ? 'text-success-ink' : 'text-ink-3'}`}>
              {captain.isAvailable ? t('available') : t('busy')}
            </span>
          )}
        </div>
        <a
          href={whatsappLink(captain.whatsapp, whatsappGreeting(captain, titles[0]))}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            stop(e);
            recordContactClick(captain.id);
          }}
          aria-label={`${t('whatsapp')} ${captain.name}`}
          className="btn btn-whatsapp h-11 w-11 min-[400px]:w-auto min-[400px]:px-3.5"
        >
          <WhatsAppIcon className="w-[18px] h-[18px]" />
          <span className="hidden min-[400px]:inline">{t('whatsapp')}</span>
        </a>
        <a
          href={telLink(captain.phone)}
          onClick={(e) => {
            stop(e);
            recordContactClick(captain.id);
          }}
          className="btn btn-primary h-11 px-4"
        >
          <Phone className="w-[18px] h-[18px]" />
          {t('callNow')}
        </a>
      </div>
    </article>
  );
};

export const CaptainGrid: React.FC<{
  captains: Captain[];
  categories: ServiceCategory[];
  onOpenProfile: (captain: Captain) => void;
}> = ({ captains, categories, onOpenProfile }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
    {captains.map((cap) => (
      <CaptainCard key={cap.id} captain={cap} categories={categories} onOpenProfile={onOpenProfile} />
    ))}
  </div>
);
