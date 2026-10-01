import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { City, ServiceCategoryId } from '../../types';
import { StateCitySelect } from '../common/StateCitySelect';
import { UserPlus, Check } from 'lucide-react';

const LANGUAGE_OPTIONS = ['Hindi', 'English', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Urdu', 'Marwari'];

export const CaptainRegistrationForm: React.FC<{ verifiedPhone?: string }> = ({ verifiedPhone }) => {
  const { allCities, categories, registerCaptain, setCaptainTab } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState(verifiedPhone || '');
  const [sameAsPhoneForWhatsapp, setSameAsPhoneForWhatsapp] = useState(true);
  const [whatsapp, setWhatsapp] = useState('');
  const [selectedCity, setSelectedCity] = useState<City | null>(allCities[0] || null);
  const [areasInput, setAreasInput] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<ServiceCategoryId[]>([]);
  const [experienceYears, setExperienceYears] = useState('2');
  const [bio, setBio] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['Hindi']);
  const [startingPrice, setStartingPrice] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleCategory = (id: ServiceCategoryId) => {
    setSelectedCategories((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) => (prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]));
  };

  const digitsOnly = (v: string) => v.replace(/\D/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !selectedCity || selectedCategories.length === 0 || !areasInput.trim() || isSubmitting) return;

    const cleanPhoneDigits = digitsOnly(phone);
    const waNumber = sameAsPhoneForWhatsapp ? `91${cleanPhoneDigits.slice(-10)}` : digitsOnly(whatsapp);

    setSubmitting(true);
    setError(null);
    try {
      await registerCaptain({
        name: name.trim(),
        phone: phone.trim(),
        whatsapp: waNumber,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=1A73E8&color=fff&size=200&bold=true`,
        cityId: selectedCity!.id,
        areas: areasInput.split(',').map((a) => a.trim()).filter(Boolean),
        categories: selectedCategories,
        experienceYears: Number(experienceYears) || 0,
        bio: bio.trim() || 'Experienced local professional ready to help with your requirements.',
        languages: selectedLanguages,
        startingPrice: startingPrice ? Number(startingPrice) : undefined,
      });
      setCaptainTab('kyc');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gradient-to-b from-orange-50/60 via-[#F5F7FA] to-[#F5F7FA] px-4 py-8">
      <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-[2rem] border border-slate-200/70 shadow-premium-lg overflow-hidden">
        <div className="relative overflow-hidden p-6 bg-gradient-to-br from-orange-600 to-amber-600 text-white">
          <div className="absolute inset-0 mesh-bg-amber opacity-40 pointer-events-none" />
          <h2 className="relative text-xl font-black flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            List Your Service — Free
          </h2>
          <p className="relative text-xs text-orange-100 mt-1">
            Fill this once. Customers in your city will be able to find and call you directly.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Full Name</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ravi Kumar"
                className="w-full text-sm p-3 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Phone Number</label>
              <input
                required
                readOnly={!!verifiedPhone}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98XXX XXXXX"
                className={`w-full text-sm p-3 border-2 rounded-2xl outline-none transition-all ${
                  verifiedPhone
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold'
                    : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10'
                }`}
              />
              {verifiedPhone && <span className="text-[11px] text-emerald-600 font-semibold">✓ Verified via OTP</span>}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-1.5">
              <input
                type="checkbox"
                checked={sameAsPhoneForWhatsapp}
                onChange={(e) => setSameAsPhoneForWhatsapp(e.target.checked)}
                className="rounded"
              />
              WhatsApp number is the same as phone number
            </label>
            {!sameAsPhoneForWhatsapp && (
              <input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="91XXXXXXXXXX (with country code)"
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-1 focus:ring-orange-500"
              />
            )}
          </div>

          <div>
            <StateCitySelect value={selectedCity} onSelect={setSelectedCity} />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Years of Experience</label>
            <input
              type="number"
              min={0}
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
              className="w-full text-sm p-3 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Areas / Localities You Serve</label>
            <input
              required
              value={areasInput}
              onChange={(e) => setAreasInput(e.target.value)}
              placeholder="e.g. Vaishali Nagar, Malviya Nagar"
              className="w-full text-sm p-3 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
            />
            <span className="text-[11px] text-slate-400">Separate multiple areas with commas</span>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">What services do you offer?</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                    selectedCategories.includes(cat.id)
                      ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-[0_4px_12px_-2px_rgba(234,88,12,0.4)] scale-[1.03]'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat.title}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">Languages You Speak</label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGE_OPTIONS.map((lang) => (
                <button
                  type="button"
                  key={lang}
                  onClick={() => toggleLanguage(lang)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                    selectedLanguages.includes(lang)
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_4px_12px_-2px_rgba(37,99,235,0.4)] scale-[1.03]'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Starting Price (Optional, ₹)</label>
              <input
                type="number"
                min={0}
                value={startingPrice}
                onChange={(e) => setStartingPrice(e.target.value)}
                placeholder="e.g. 149"
                className="w-full text-sm p-3 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Short Bio (Optional)</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell customers what you specialize in..."
              className="w-full text-xs p-3 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
            />
          </div>

          {error && <p className="text-xs text-rose-600 font-semibold text-center">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-sm rounded-2xl shadow-[0_8px_24px_-6px_rgba(234,88,12,0.5)] hover:shadow-[0_10px_30px_-6px_rgba(234,88,12,0.6)] hover-lift active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4" />
            <span>{isSubmitting ? 'Submitting...' : 'Submit for Verification'}</span>
          </button>
          <p className="text-[11px] text-slate-400 text-center">
            After submitting, an ID document (Aadhaar) is required before your profile goes live to customers.
          </p>
        </form>
      </div>
      </div>
    </div>
  );
};
