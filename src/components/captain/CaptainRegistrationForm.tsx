import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { ServiceCategoryId } from '../../types';
import { UserPlus, Check } from 'lucide-react';

const LANGUAGE_OPTIONS = ['Hindi', 'English', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Urdu', 'Marwari'];

export const CaptainRegistrationForm: React.FC = () => {
  const { allCities, categories, registerCaptain, setCaptainTab } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [sameAsPhoneForWhatsapp, setSameAsPhoneForWhatsapp] = useState(true);
  const [whatsapp, setWhatsapp] = useState('');
  const [cityId, setCityId] = useState(allCities[0]?.id || '');
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
    if (!name.trim() || !phone.trim() || selectedCategories.length === 0 || !areasInput.trim() || isSubmitting) return;

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
        cityId,
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
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-orange-600 to-amber-600 text-white">
          <h2 className="text-lg font-black flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            List Your Service — Free
          </h2>
          <p className="text-xs text-orange-100 mt-1">
            Fill this once. Customers in your city will be able to find and call you directly.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ravi Kumar"
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
              <input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98XXX XXXXX"
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-1 focus:ring-orange-500"
              />
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">City</label>
              <select
                value={cityId}
                onChange={(e) => setCityId(e.target.value as typeof cityId)}
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              >
                {allCities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Years of Experience</label>
              <input
                type="number"
                min={0}
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Areas / Localities You Serve</label>
            <input
              required
              value={areasInput}
              onChange={(e) => setAreasInput(e.target.value)}
              placeholder="e.g. Vaishali Nagar, Malviya Nagar"
              className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-1 focus:ring-orange-500"
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedCategories.includes(cat.id)
                      ? 'bg-orange-600 text-white shadow-xs'
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedLanguages.includes(lang)
                      ? 'bg-blue-600 text-white shadow-xs'
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
              <label className="text-xs font-bold text-slate-700 block mb-1">Starting Price (Optional, ₹)</label>
              <input
                type="number"
                min={0}
                value={startingPrice}
                onChange={(e) => setStartingPrice(e.target.value)}
                placeholder="e.g. 149"
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Short Bio (Optional)</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell customers what you specialize in..."
              className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-2xl focus:bg-white focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {error && <p className="text-xs text-rose-600 font-semibold text-center">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-sm rounded-2xl shadow-lg transition-transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
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
  );
};
