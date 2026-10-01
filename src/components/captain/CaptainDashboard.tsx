import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Eye, Phone, Star, Radio, Pencil, Check, ShieldCheck, Clock3, XCircle } from 'lucide-react';

export const CaptainDashboard: React.FC = () => {
  const { currentCaptain, categories, toggleAvailability, updateCaptainProfile, t } = useApp();

  const [isEditing, setEditing] = useState(false);
  const [bio, setBio] = useState(currentCaptain?.bio || '');
  const [areasInput, setAreasInput] = useState(currentCaptain?.areas.join(', ') || '');
  const [startingPrice, setStartingPrice] = useState(String(currentCaptain?.startingPrice ?? ''));

  if (!currentCaptain) return null;

  const categoryTitles = currentCaptain.categories
    .map((id) => categories.find((c) => c.id === id)?.title)
    .filter(Boolean);

  const kycBanner = {
    verified: null,
    pending: {
      icon: Clock3,
      color: 'bg-amber-50 border-amber-200 text-amber-800',
      text: t('kycStatusPending'),
    },
    rejected: {
      icon: XCircle,
      color: 'bg-rose-50 border-rose-200 text-rose-800',
      text: 'Verification rejected — please re-check your details in the KYC tab.',
    },
  }[currentCaptain.kycStatus];

  const handleSaveEdit = () => {
    updateCaptainProfile(currentCaptain.id, {
      bio,
      areas: areasInput.split(',').map((a) => a.trim()).filter(Boolean),
      startingPrice: startingPrice ? Number(startingPrice) : undefined,
    });
    setEditing(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      {kycBanner && (
        <div className={`flex items-center gap-2.5 rounded-2xl p-3.5 border text-xs font-semibold ${kycBanner.color}`}>
          <kycBanner.icon className="w-4 h-4 shrink-0" />
          <span>{kycBanner.text}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200/70 shadow-premium p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={currentCaptain.avatar}
              alt={currentCaptain.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-premium ring-2 ring-orange-400/60"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-black text-slate-900">{currentCaptain.name}</h2>
                {currentCaptain.kycStatus === 'verified' && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
              </div>
              <p className="text-[11px] text-blue-700 font-semibold">{categoryTitles.join(' • ')}</p>
              <p className="text-[11px] text-slate-500">{currentCaptain.areas.join(', ')}</p>
            </div>
          </div>
          <button
            onClick={() => toggleAvailability(currentCaptain.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs shadow-premium hover-lift transition-all shrink-0 ${
              currentCaptain.isAvailable ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${currentCaptain.isAvailable ? 'animate-pulse' : ''}`} />
            <span className="hidden sm:inline">{currentCaptain.isAvailable ? t('availableNow') : t('notAvailable')}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs hover:shadow-premium hover-lift transition-all p-3.5 text-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2">
            <Eye className="w-5 h-5" />
          </div>
          <span className="block text-lg font-black text-slate-900">{currentCaptain.profileViews}</span>
          <span className="block text-[10px] text-slate-500 uppercase font-semibold tracking-wide">Profile Views</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs hover:shadow-premium hover-lift transition-all p-3.5 text-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
            <Phone className="w-5 h-5" />
          </div>
          <span className="block text-lg font-black text-slate-900">{currentCaptain.contactClicks}</span>
          <span className="block text-[10px] text-slate-500 uppercase font-semibold tracking-wide">Contact Clicks</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs hover:shadow-premium hover-lift transition-all p-3.5 text-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-2">
            <Star className="w-5 h-5 fill-amber-500" />
          </div>
          <span className="block text-lg font-black text-slate-900">
            {currentCaptain.rating > 0 ? currentCaptain.rating.toFixed(2) : '—'}
          </span>
          <span className="block text-[10px] text-slate-500 uppercase font-semibold tracking-wide">Rating ({currentCaptain.reviewCount})</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/70 shadow-premium p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-slate-900">Your Profile</h3>
          {!isEditing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
          ) : (
            <button
              onClick={handleSaveEdit}
              className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline"
            >
              <Check className="w-3.5 h-3.5" />
              Save
            </button>
          )}
        </div>

        {!isEditing ? (
          <div className="space-y-2 text-xs text-slate-600">
            <p>{currentCaptain.bio}</p>
            <p><strong className="text-slate-800">Areas:</strong> {currentCaptain.areas.join(', ')}</p>
            {currentCaptain.startingPrice != null && (
              <p><strong className="text-slate-800">Starting price:</strong> ₹{currentCaptain.startingPrice}</p>
            )}
            <p><strong className="text-slate-800">Languages:</strong> {currentCaptain.languages.join(', ')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Bio</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Areas served (comma separated)</label>
              <input
                value={areasInput}
                onChange={(e) => setAreasInput(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Starting price (₹)</label>
              <input
                type="number"
                value={startingPrice}
                onChange={(e) => setStartingPrice(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
