import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../ui/Avatar';
import { Switch } from '../ui/Switch';
import { formatPrice } from '../../utils/format';
import {
  Eye, Phone, Star, Pencil, Check, BadgeCheck, Clock3, XCircle, TrendingUp, MapPin, Languages, IndianRupee, CircleCheck, Circle, ChevronRight, X,
} from 'lucide-react';

type CaptainTab = 'dashboard' | 'reviews' | 'kyc';

export const CaptainDashboard: React.FC<{ onOpenTab: (tab: CaptainTab) => void }> = ({ onOpenTab }) => {
  const { currentCaptain, categories, toggleAvailability, updateCaptainProfile, t } = useApp();

  const [isEditing, setEditing] = useState(false);
  const [bio, setBio] = useState(currentCaptain?.bio || '');
  const [areasInput, setAreasInput] = useState(currentCaptain?.areas.join(', ') || '');
  const [startingPrice, setStartingPrice] = useState(String(currentCaptain?.startingPrice ?? ''));

  if (!currentCaptain) return null;
  const cap = currentCaptain;

  const categoryTitles = cap.categories.map((id) => categories.find((c) => c.id === id)?.title).filter(Boolean);

  const kycBanner = {
    verified: null,
    pending: { icon: Clock3, cls: 'bg-warn-soft text-warn-ink', title: t('kycStatusPending'), body: 'Our team usually reviews new listings within 24–48 hours.' },
    rejected: { icon: XCircle, cls: 'bg-danger-soft text-danger-ink', title: 'Verification rejected', body: 'Please re-check your details in the Verification tab.' },
  }[cap.kycStatus];

  const conversion = cap.profileViews > 0 ? Math.round((cap.contactClicks / cap.profileViews) * 100) : 0;

  const STATS = [
    { icon: Eye, label: 'Profile views', value: cap.profileViews.toLocaleString('en-IN'), cls: 'bg-info-soft text-info-ink' },
    { icon: Phone, label: 'Calls & chats', value: cap.contactClicks.toLocaleString('en-IN'), cls: 'bg-success-soft text-success-ink' },
    { icon: Star, label: `${t('rating')} (${cap.reviewCount})`, value: cap.rating > 0 ? cap.rating.toFixed(1) : '—', cls: 'bg-warn-soft text-warn-ink' },
  ];

  // Profile strength — nudges captains toward the details that win customer calls.
  const CHECKS = [
    { done: !cap.avatar.includes('ui-avatars.com'), label: 'Add a real profile photo', hint: 'Profiles with a photo get noticeably more calls' },
    { done: cap.bio.trim().length >= 60, label: 'Write a detailed bio', hint: 'Mention your specialities and how fast you can visit' },
    { done: cap.startingPrice != null, label: 'Set a starting price', hint: 'Customers prefer pros who show prices upfront' },
    { done: cap.areas.length >= 2, label: 'Serve 2+ areas', hint: 'Add nearby localities to appear for more customers' },
    { done: cap.kycStatus === 'verified', label: 'Get ID-verified', hint: 'Only verified profiles are shown to customers', tab: 'kyc' as const },
    { done: cap.reviewCount > 0, label: 'Get your first review', hint: 'Ask happy customers to review you on HomeServ', tab: 'reviews' as const },
  ];
  const strength = Math.round((CHECKS.filter((c) => c.done).length / CHECKS.length) * 100);

  const handleSaveEdit = () => {
    updateCaptainProfile(cap.id, {
      bio,
      areas: areasInput.split(',').map((a) => a.trim()).filter(Boolean),
      startingPrice: startingPrice ? Number(startingPrice) : undefined,
    });
    setEditing(false);
  };

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_20rem] gap-4 sm:gap-5 items-start">
      <div className="space-y-4 sm:space-y-5 min-w-0">
        {kycBanner && (
          <button
            onClick={() => onOpenTab('kyc')}
            className={`w-full flex items-center gap-3 rounded-2xl p-4 text-left ${kycBanner.cls}`}
          >
            <kycBanner.icon className="w-5 h-5 shrink-0" />
            <span className="flex-1">
              <span className="block text-sm font-bold">{kycBanner.title}</span>
              <span className="block text-[13px] opacity-85">{kycBanner.body}</span>
            </span>
            <ChevronRight className="w-4 h-4 shrink-0" />
          </button>
        )}

        {/* Identity + availability */}
        <section className="card p-5 relative overflow-hidden">
          <div className="absolute -right-12 -top-16 w-48 h-48 rounded-full bg-orange-500/15 blur-3xl pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <Avatar src={cap.avatar} name={cap.name} className="w-[4.5rem] h-[4.5rem] rounded-2xl ring-2 ring-orange-400/50" textClassName="text-2xl" />
            <div className="min-w-0">
              <h2 className="flex items-center gap-1.5 text-xl font-bold text-ink">
                <span className="truncate">{cap.name}</span>
                {cap.kycStatus === 'verified' && <BadgeCheck className="w-5 h-5 text-info-ink shrink-0" />}
              </h2>
              <p className="text-sm font-semibold text-accent-ink truncate">{categoryTitles.join(' · ')}</p>
              <p className="flex items-center gap-1 text-[13px] text-ink-3 truncate">
                <MapPin className="w-3.5 h-3.5 shrink-0" /> {cap.areas.join(', ')}
              </p>
            </div>
          </div>

          <div
            className={`relative mt-5 flex items-center gap-4 rounded-2xl p-4 border transition-colors ${
              cap.isAvailable ? 'bg-success-soft border-transparent' : 'bg-surface-2 border-line'
            }`}
          >
            <div className="flex-1">
              <p className={`text-[15px] font-bold ${cap.isAvailable ? 'text-success-ink' : 'text-ink'}`}>
                {cap.isAvailable ? t('availableNow') : t('notAvailable')}
              </p>
              <p className="text-[13px] text-ink-2 mt-0.5">
                {cap.isAvailable
                  ? 'Customers see a green “Available” badge on your profile.'
                  : 'Turn on when you can take new work — you\'ll rank higher.'}
              </p>
            </div>
            <Switch checked={cap.isAvailable} onChange={() => toggleAvailability(cap.id)} label={t('availableNow')} />
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-3 gap-2.5 sm:gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="card p-3.5 sm:p-5">
              <span className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${s.cls}`}>
                <s.icon className="w-[18px] h-[18px]" />
              </span>
              <div className="mt-3 font-display text-2xl sm:text-3xl font-bold text-ink">{s.value}</div>
              <div className="text-[11px] sm:text-[13px] text-ink-3 font-medium leading-tight mt-0.5">{s.label}</div>
            </div>
          ))}
        </section>
        {cap.profileViews > 0 && (
          <p className="flex items-center gap-2 text-[13px] text-ink-2 -mt-1 px-1">
            <TrendingUp className="w-4 h-4 text-success-ink shrink-0" />
            <span>
              <span className="font-bold text-ink">{conversion}%</span> of people who viewed your profile called or messaged you.
            </span>
          </p>
        )}

        {/* Profile details */}
        <section className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-ink">Your profile</h3>
            {!isEditing ? (
              <button onClick={() => setEditing(true)} className="btn btn-secondary h-9 px-3.5 text-[13px]">
                <Pencil className="w-4 h-4" /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="btn btn-ghost h-9 px-3 text-[13px]">
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button onClick={handleSaveEdit} className="btn btn-primary h-9 px-3.5 text-[13px]">
                  <Check className="w-4 h-4" /> Save
                </button>
              </div>
            )}
          </div>

          {!isEditing ? (
            <div className="space-y-4">
              <p className="text-[15px] text-ink-2 leading-relaxed">{cap.bio}</p>
              <dl className="grid sm:grid-cols-3 gap-2.5">
                {[
                  { icon: MapPin, label: t('areasServed'), value: cap.areas.join(', ') },
                  { icon: IndianRupee, label: t('startsAt'), value: cap.startingPrice != null ? formatPrice(cap.startingPrice) : 'Not set' },
                  { icon: Languages, label: t('languagesSpoken'), value: cap.languages.join(', ') },
                ].map((row) => (
                  <div key={row.label} className="rounded-2xl bg-surface-2 border border-line p-3.5">
                    <dt className="flex items-center gap-1.5 text-xs font-semibold text-ink-3">
                      <row.icon className="w-3.5 h-3.5" /> {row.label}
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-ink">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="field-label" htmlFor="edit-bio">Bio</label>
                <textarea id="edit-bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} className="input resize-none" />
                <p className="mt-1 text-xs text-ink-3">{bio.trim().length} characters · 60+ recommended</p>
              </div>
              <div>
                <label className="field-label" htmlFor="edit-areas">Areas served (comma separated)</label>
                <input id="edit-areas" value={areasInput} onChange={(e) => setAreasInput(e.target.value)} className="input" />
              </div>
              <div>
                <label className="field-label" htmlFor="edit-price">Starting price (₹)</label>
                <input id="edit-price" type="number" inputMode="numeric" min={0} value={startingPrice} onChange={(e) => setStartingPrice(e.target.value)} className="input" />
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Profile strength */}
      <aside className="card p-5 lg:sticky lg:top-24">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-ink">Profile strength</h3>
          <span className="font-display text-2xl font-bold text-gradient">{strength}%</span>
        </div>
        <div className="mt-3 h-2.5 rounded-full bg-surface-3 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500" style={{ width: `${strength}%` }} />
        </div>
        <ul className="mt-4 space-y-1">
          {CHECKS.map((c) => (
            <li key={c.label}>
              <button
                onClick={() => (c.tab ? onOpenTab(c.tab) : !c.done && setEditing(true))}
                disabled={c.done}
                className="w-full flex items-start gap-3 p-2 -mx-2 rounded-xl text-left enabled:hover:bg-surface-2 transition-colors"
              >
                {c.done ? (
                  <CircleCheck className="w-5 h-5 text-success-ink shrink-0 mt-px" />
                ) : (
                  <Circle className="w-5 h-5 text-ink-3 shrink-0 mt-px" />
                )}
                <span>
                  <span className={`block text-sm font-semibold ${c.done ? 'text-ink-3 line-through decoration-ink-3/40' : 'text-ink'}`}>{c.label}</span>
                  {!c.done && <span className="block text-xs text-ink-3 mt-0.5">{c.hint}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
};
