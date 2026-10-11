import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sheet, SheetBody, SheetFooter } from '../ui/Sheet';
import { Avatar } from '../ui/Avatar';
import { RatingSummary, Stars } from '../ui/Rating';
import { WhatsAppIcon } from '../ui/WhatsAppIcon';
import { describeArea } from '../../utils/serviceAreas';
import { firstName, formatPrice, shareText, telLink, timeAgo, whatsappGreeting, whatsappLink } from '../../utils/format';
import {
  X, Star, BadgeCheck, MapPin, Phone, Heart, Languages, Briefcase, IndianRupee, Eye, Share2, Check, PenLine, ShieldCheck, MessageSquareText,
} from 'lucide-react';

export const CaptainProfileSheet: React.FC<{
  captainId: string | null;
  onClose: () => void;
  onWriteReview: (captainId: string) => void;
}> = ({ captainId, onClose, onWriteReview }) => {
  const { captains, categories, reviews, isFavorite, toggleFavorite, recordContactClick, recordProfileView, selectedCity, language, t } = useApp();
  const [shareState, setShareState] = useState<'idle' | 'copied'>('idle');

  // Always read the live captain so rating/review counts update after a new review.
  const captain = captains.find((c) => c.id === captainId) || null;

  useEffect(() => {
    if (captainId) recordProfileView(captainId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [captainId]);

  if (!captain) return null;

  const favorite = isFavorite(captain.id);
  const captainReviews = reviews.filter((r) => r.captainId === captain.id);
  const titles = captain.categories.map((id) => categories.find((c) => c.id === id)?.title).filter(Boolean) as string[];

  const handleShare = async () => {
    const text = `${captain.name} — ${titles.join(', ')} in ${selectedCity.name}, verified on HomeServ.\nCall: ${captain.phone}`;
    const result = await shareText(captain.name, text);
    if (result === 'copied') {
      setShareState('copied');
      setTimeout(() => setShareState('idle'), 2000);
    }
  };

  const STATS = [
    {
      icon: <Star className="w-4 h-4 fill-star text-star" />,
      value: captain.rating > 0 ? captain.rating.toFixed(1) : t('newListing'),
      label: `${captain.reviewCount} ${t('reviews').toLowerCase()}`,
    },
    { icon: <Briefcase className="w-4 h-4 text-info-ink" />, value: `${captain.experienceYears} ${t('yrs')}`, label: t('experience') },
    {
      icon: <IndianRupee className="w-4 h-4 text-success-ink" />,
      value: captain.startingPrice != null ? formatPrice(captain.startingPrice) : '—',
      label: t('startsAt'),
    },
    { icon: <Eye className="w-4 h-4 text-accent-ink" />, value: captain.profileViews.toLocaleString('en-IN'), label: 'Views' },
  ];

  return (
    <Sheet open={!!captain} onClose={onClose} label={captain.name} widthClass="sm:max-w-2xl">
      <SheetBody>
        {/* Cover */}
        <div className="relative h-28 sm:h-36 bg-gradient-to-br from-orange-500/40 via-amber-400/15 to-violet-500/20 overflow-hidden">
          <div className="absolute -left-10 -top-16 w-56 h-56 rounded-full bg-orange-500/30 blur-3xl" />
          <div className="absolute right-0 bottom-0 w-48 h-32 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="absolute top-3 right-3 flex gap-2">
            <button onClick={handleShare} className="icon-btn glass w-10 h-10" aria-label={t('share')}>
              {shareState === 'copied' ? <Check className="w-[18px] h-[18px] text-success-ink" /> : <Share2 className="w-[18px] h-[18px]" />}
            </button>
            <button
              onClick={() => toggleFavorite(captain.id)}
              className={`icon-btn glass w-10 h-10 ${favorite ? '!text-rose-500' : ''}`}
              aria-pressed={favorite}
              aria-label={favorite ? t('removeFromFavorites') : t('addToFavorites')}
            >
              <Heart className={`w-[18px] h-[18px] ${favorite ? 'fill-rose-500' : ''}`} />
            </button>
            <button onClick={onClose} className="icon-btn glass w-10 h-10" aria-label="Close">
              <X className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>

        <div className="px-5 sm:px-7 pb-6">
          {/* Identity */}
          <div className="-mt-12 sm:-mt-14 relative flex items-end gap-4">
            <div className="relative">
              <Avatar
                src={captain.avatar}
                name={captain.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-[1.75rem] ring-4 ring-[var(--surface-solid)] shadow-card"
                textClassName="text-3xl"
              />
              <span
                className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-[3px] border-[var(--surface-solid)] ${
                  captain.isAvailable ? 'bg-success' : 'bg-ink-3'
                }`}
              />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="flex items-center gap-1.5 text-2xl sm:text-[1.75rem] font-bold text-ink leading-tight">
              {captain.name}
              {captain.kycStatus === 'verified' && <BadgeCheck className="w-6 h-6 text-info-ink shrink-0" aria-label={t('verified')} />}
            </h2>
            <p className="mt-0.5 text-[15px] font-semibold text-accent-ink">{titles.join(' · ')}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className={`pill ${captain.isAvailable ? 'bg-success-soft text-success-ink' : ''}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${captain.isAvailable ? 'bg-success' : 'bg-ink-3'}`} />
                {captain.isAvailable ? t('availableNow') : t('notAvailable')}
              </span>
              {captain.kycStatus === 'verified' && (
                <span className="pill bg-info-soft text-info-ink">
                  <ShieldCheck className="w-3.5 h-3.5" /> ID {t('verified').toLowerCase()}
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-5 grid grid-cols-4 gap-2">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-2xl bg-surface-2 border border-line px-2 py-3 text-center">
                <div className="flex justify-center">{s.icon}</div>
                <div className="mt-1.5 font-display text-[15px] sm:text-base font-bold text-ink truncate">{s.value}</div>
                <div className="text-[10.5px] sm:text-[11px] text-ink-3 truncate">{s.label}</div>
              </div>
            ))}
          </div>

          {/* About */}
          <section className="mt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-3 mb-2">{t('about')}</h3>
            <p className="text-[15px] text-ink-2 leading-relaxed">{captain.bio}</p>
          </section>

          <section className="mt-5 grid sm:grid-cols-2 gap-5">
            <div>
              <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink-3 mb-2">
                <MapPin className="w-3.5 h-3.5" /> {t('areasServed')}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {captain.serviceAreas?.length
                  ? captain.serviceAreas.map((a) => (
                      <span key={a.district.code} className="pill !py-1 !px-2.5 !text-[13px] !whitespace-normal">{describeArea(a)}</span>
                    ))
                  : captain.areas.map((a) => (
                      <span key={a} className="pill !py-1 !px-2.5 !text-[13px]">{a}</span>
                    ))}
              </div>
            </div>
            <div>
              <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink-3 mb-2">
                <Languages className="w-3.5 h-3.5" /> {t('languagesSpoken')}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {captain.languages.map((l) => (
                  <span key={l} className="pill !py-1 !px-2.5 !text-[13px]">{l}</span>
                ))}
              </div>
            </div>
          </section>

          {/* Reviews */}
          <section className="mt-7">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-ink">
                {t('reviews')} <span className="text-ink-3 font-semibold">({captainReviews.length})</span>
              </h3>
              <button onClick={() => onWriteReview(captain.id)} className="btn btn-secondary h-9 px-3.5 text-[13px]">
                <PenLine className="w-4 h-4" />
                {t('writeReview')}
              </button>
            </div>
            {captainReviews.length === 0 ? (
              <div className="rounded-2xl bg-surface-2 border border-dashed border-line-strong p-5 text-center">
                <MessageSquareText className="w-6 h-6 mx-auto text-ink-3" />
                <p className="mt-2 text-sm text-ink-2">No reviews yet — hired {firstName(captain.name)}? Be the first to review.</p>
              </div>
            ) : (
              <>
                <RatingSummary rating={captain.rating} count={captain.reviewCount} reviews={captainReviews} />
                <ul className="mt-3 space-y-2.5">
                  {captainReviews.map((r) => (
                    <li key={r.id} className="rounded-2xl bg-surface-2 border border-line p-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={r.customerName} className="w-9 h-9 rounded-full" textClassName="text-xs" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-ink truncate">{r.customerName}</p>
                          <p className="text-[11px] text-ink-3">{timeAgo(r.date, language)}</p>
                        </div>
                        <Stars value={r.rating} />
                      </div>
                      {r.comment && <p className="mt-2.5 text-sm text-ink-2 leading-relaxed">{r.comment}</p>}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          <p className="mt-6 flex items-start gap-2 rounded-2xl bg-warn-soft text-warn-ink p-3.5 text-[13px] leading-snug">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-px" />
            {t('safetyNote')}
          </p>
        </div>
      </SheetBody>

      <SheetFooter className="grid grid-cols-2 gap-2.5">
        <a
          href={whatsappLink(captain.whatsapp, whatsappGreeting(captain, titles[0]))}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => recordContactClick(captain.id)}
          className="btn btn-whatsapp h-[3.25rem] text-[15px]"
        >
          <WhatsAppIcon className="w-5 h-5" />
          {t('whatsapp')}
        </a>
        <a href={telLink(captain.phone)} onClick={() => recordContactClick(captain.id)} className="btn btn-primary h-[3.25rem] text-[15px]">
          <Phone className="w-5 h-5" />
          {t('callNow')}
        </a>
      </SheetFooter>
    </Sheet>
  );
};
