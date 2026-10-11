import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { ServiceArea, ServiceCategoryId } from '../../types';
import { ServiceAreaPicker } from './ServiceAreaPicker';
import { HomeVillageFields } from './HomeVillageFields';
import { toServiceAreaInput } from '../../utils/serviceAreas';
import { CategoryIcon } from '../common/CategoryIcon';
import { UserPlus, Check, BadgeCheck, MapPin, Wrench, IndianRupee, User } from 'lucide-react';

const LANGUAGE_OPTIONS = ['Hindi', 'English', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Urdu', 'Marwari'];

const Section: React.FC<{ step: number; icon: React.ElementType; title: string; children: React.ReactNode }> = ({ step, icon: Icon, title, children }) => (
  <section className="py-6 first:pt-0">
    <h3 className="flex items-center gap-2.5 text-base font-bold text-ink mb-4">
      <span className="w-8 h-8 rounded-lg bg-accent-soft text-accent-ink flex items-center justify-center text-sm font-display">{step}</span>
      <Icon className="w-4 h-4 text-ink-3" />
      {title}
    </h3>
    <div className="space-y-4">{children}</div>
  </section>
);

export const CaptainRegistrationForm: React.FC<{ verifiedPhone?: string }> = ({ verifiedPhone }) => {
  const { allCities, categories, registerCaptain, setCaptainTab } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState(verifiedPhone || '');
  const [sameAsPhoneForWhatsapp, setSameAsPhoneForWhatsapp] = useState(true);
  const [whatsapp, setWhatsapp] = useState('');
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [home, setHome] = useState<{ subdistrictCode: number; villageCode?: number } | null>(null);
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
  const canSubmit = !!name.trim() && !!phone.trim() && serviceAreas.length > 0 && selectedCategories.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || isSubmitting) {
      if (selectedCategories.length === 0) setError('Pick at least one service you offer.');
      else if (serviceAreas.length === 0) setError('Add the district and mandals where you work.');
      return;
    }

    const cleanPhoneDigits = digitsOnly(phone);
    const waNumber = sameAsPhoneForWhatsapp ? `91${cleanPhoneDigits.slice(-10)}` : digitsOnly(whatsapp);

    setSubmitting(true);
    setError(null);
    try {
      await registerCaptain({
        name: name.trim(),
        phone: phone.trim(),
        whatsapp: waNumber,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=FF7A1A&color=fff&size=200&bold=true`,
        serviceAreas: toServiceAreaInput(serviceAreas),
        ...(home ? { homePlace: home } : {}),
        ...(areasInput.trim() ? { areas: areasInput.split(',').map((a) => a.trim()).filter(Boolean) } : {}),
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-16 animate-page-enter">
      <div className="mb-6">
        <span className="pill bg-accent-soft text-accent-ink !px-2.5">
          <UserPlus className="w-3.5 h-3.5" /> New captain
        </span>
        <h1 className="mt-2.5 text-[1.75rem] sm:text-4xl font-bold text-ink">List your service — free</h1>
        <p className="text-[15px] text-ink-2 mt-1">Fill this once. Customers in your city will be able to find and call you directly.</p>
      </div>

      <form onSubmit={handleSubmit} className="card !bg-surface-solid p-5 sm:p-8 [&>section+section]:border-t [&>section+section]:border-line">
        <Section step={1} icon={User} title="About you">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label" htmlFor="reg-name">Full name</label>
              <input id="reg-name" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ravi Kumar" className="input" />
            </div>
            <div>
              <label className="field-label" htmlFor="reg-phone">Phone number</label>
              <input
                id="reg-phone"
                required
                readOnly={!!verifiedPhone}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98XXX XXXXX"
                className={`input ${verifiedPhone ? '!bg-success-soft !border-transparent !text-success-ink font-semibold' : ''}`}
              />
              {verifiedPhone && (
                <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-success-ink">
                  <BadgeCheck className="w-3.5 h-3.5" /> Verified via OTP
                </span>
              )}
            </div>
          </div>
          <label className="flex items-center gap-3 text-sm font-medium text-ink-2 cursor-pointer">
            <input
              type="checkbox"
              checked={sameAsPhoneForWhatsapp}
              onChange={(e) => setSameAsPhoneForWhatsapp(e.target.checked)}
              className="w-5 h-5 rounded accent-orange-500"
            />
            My WhatsApp number is the same as my phone number
          </label>
          {!sameAsPhoneForWhatsapp && (
            <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="91XXXXXXXXXX (with country code)" inputMode="numeric" className="input" />
          )}
        </Section>

        <Section step={2} icon={Wrench} title="What services do you offer?">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            {categories
              .filter((c) => c.isActive)
              .map((cat) => {
                const selected = selectedCategories.includes(cat.id);
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    aria-pressed={selected}
                    className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border text-center transition-all active:scale-95 ${
                      selected ? 'bg-accent-soft border-orange-400/60' : 'bg-surface-2 border-line hover:border-line-strong'
                    }`}
                  >
                    {selected && (
                      <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent text-on-accent flex items-center justify-center">
                        <Check className="w-3 h-3" strokeWidth={3} />
                      </span>
                    )}
                    <CategoryIcon categoryId={cat.id} title={cat.title} iconName={cat.iconName} colorClass={cat.color} className="w-12 h-12" iconClassName="w-5 h-5" />
                    <span className={`text-xs font-semibold leading-tight ${selected ? 'text-accent-ink' : 'text-ink-2'}`}>{cat.title}</span>
                  </button>
                );
              })}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label" htmlFor="reg-exp">Experience (years)</label>
              <input id="reg-exp" type="number" inputMode="numeric" min={0} value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} className="input" />
            </div>
            <div>
              <label className="field-label" htmlFor="reg-price">Starting price (₹)</label>
              <input id="reg-price" type="number" inputMode="numeric" min={0} value={startingPrice} onChange={(e) => setStartingPrice(e.target.value)} placeholder="Optional, e.g. 149" className="input" />
            </div>
          </div>
        </Section>

        <Section step={3} icon={MapPin} title="Where do you work?">
          <p className="-mt-2 text-[13px] text-ink-3">
            Customers in these mandals see you first, then the rest of the district. You can add up to 5 districts.
          </p>
          <ServiceAreaPicker value={serviceAreas} onChange={setServiceAreas} defaultStateName={allCities[0]?.state} />
          {serviceAreas.length > 0 && <HomeVillageFields areas={serviceAreas} value={home} onChange={setHome} />}
          <div>
            <label className="field-label" htmlFor="reg-areas">Colonies / localities (optional)</label>
            <input id="reg-areas" value={areasInput} onChange={(e) => setAreasInput(e.target.value)} placeholder="e.g. Vaishali Nagar, Malviya Nagar" className="input" />
            <p className="mt-1 text-xs text-ink-3">Shown on your profile. Separate with commas.</p>
          </div>
        </Section>

        <Section step={4} icon={IndianRupee} title="Help customers choose you">
          <div>
            <span className="field-label">Languages you speak</span>
            <div className="flex flex-wrap gap-2">
              {LANGUAGE_OPTIONS.map((lang) => (
                <button type="button" key={lang} onClick={() => toggleLanguage(lang)} aria-pressed={selectedLanguages.includes(lang)} className="chip">
                  {selectedLanguages.includes(lang) && <Check className="w-3.5 h-3.5" />}
                  {lang}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="reg-bio">Short bio (optional)</label>
            <textarea id="reg-bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell customers what you specialise in and how quickly you can visit…" className="input resize-none" />
          </div>
        </Section>

        <div className="pt-6 border-t border-line">
          {error && <p className="mb-3 text-sm text-danger-ink font-semibold text-center">{error}</p>}
          <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full h-[3.25rem] text-[15px]">
            <Check className="w-5 h-5" />
            {isSubmitting ? 'Submitting…' : 'Submit for verification'}
          </button>
          <p className="mt-3 text-xs text-ink-3 text-center">
            After submitting, an ID document (Aadhaar) is required before your profile goes live to customers.
          </p>
        </div>
      </form>
    </div>
  );
};
