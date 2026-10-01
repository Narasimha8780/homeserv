import React, { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import type {
  AppRole,
  AppLanguage,
  City,
  ServiceCategory,
  ServiceCategoryId,
  Captain,
  Review,
  KycStatus,
} from '../types';
import { CITIES, SERVICE_CATEGORIES, CAPTAINS, REVIEWS } from '../data/seedData';
import { translations } from '../i18n/translations';
import { soundFx } from '../utils/audio';

export interface CaptainRegistrationInput {
  name: string;
  phone: string;
  whatsapp: string;
  avatar: string;
  cityId: City['id'];
  areas: string[];
  categories: ServiceCategoryId[];
  experienceYears: number;
  bio: string;
  languages: string[];
  startingPrice?: number;
}

interface AppContextType {
  role: AppRole;
  setRole: (role: AppRole) => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: (key: string) => string;

  customerTab: 'home' | 'favorites' | 'more';
  setCustomerTab: (tab: 'home' | 'favorites' | 'more') => void;
  captainTab: 'dashboard' | 'reviews' | 'kyc';
  setCaptainTab: (tab: 'dashboard' | 'reviews' | 'kyc') => void;
  adminTab: 'overview' | 'kyc' | 'categories';
  setAdminTab: (tab: 'overview' | 'kyc' | 'categories') => void;

  selectedCity: City;
  setSelectedCity: (city: City) => void;
  allCities: City[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  categories: ServiceCategory[];
  captains: Captain[];
  reviews: Review[];
  favorites: string[];

  activeCaptainId: string | null;
  setActiveCaptainId: (id: string | null) => void;
  currentCaptain: Captain | null;

  toggleFavorite: (captainId: string) => void;
  isFavorite: (captainId: string) => boolean;
  recordContactClick: (captainId: string) => void;
  recordProfileView: (captainId: string) => void;
  submitReview: (captainId: string, customerName: string, rating: number, comment: string) => void;

  registerCaptain: (input: CaptainRegistrationInput) => Captain;
  updateCaptainProfile: (id: string, updates: Partial<Captain>) => void;
  toggleAvailability: (id: string) => void;

  approveCaptainKyc: (id: string) => void;
  rejectCaptainKyc: (id: string) => void;
  toggleCategoryActive: (id: ServiceCategoryId) => void;
  addCategory: (title: string, iconName: string) => void;

  resetToDefault: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'homeserv_directory_v1';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<AppRole>('customer');
  const [language, setLanguage] = useState<AppLanguage>('en');
  const [customerTab, setCustomerTab] = useState<'home' | 'favorites' | 'more'>('home');
  const [captainTab, setCaptainTab] = useState<'dashboard' | 'reviews' | 'kyc'>('dashboard');
  const [adminTab, setAdminTab] = useState<'overview' | 'kyc' | 'categories'>('overview');

  const [allCities] = useState<City[]>(CITIES);
  const [selectedCity, setSelectedCity] = useState<City>(CITIES[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [categories, setCategories] = useState<ServiceCategory[]>(SERVICE_CATEGORIES);
  const [captains, setCaptains] = useState<Captain[]>(CAPTAINS);
  const [reviews, setReviews] = useState<Review[]>(REVIEWS);
  const [favorites, setFavorites] = useState<string[]>([]);

  const [activeCaptainId, setActiveCaptainId] = useState<string | null>('cap-ravi');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.captains) setCaptains(parsed.captains);
        if (parsed.categories) setCategories(parsed.categories);
        if (parsed.reviews) setReviews(parsed.reviews);
        if (parsed.favorites) setFavorites(parsed.favorites);
        if (parsed.language) setLanguage(parsed.language);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({ captains, categories, reviews, favorites, language })
      );
    } catch {
      // ignore
    }
  }, [captains, categories, reviews, favorites, language]);

  const currentCaptain = useMemo(
    () => captains.find((c) => c.id === activeCaptainId) || null,
    [captains, activeCaptainId]
  );

  const t = (key: string): string => {
    const langDict = translations[language] || translations.en;
    return langDict[key] || translations.en[key] || key;
  };

  const toggleFavorite = (captainId: string) => {
    soundFx.playTap();
    setFavorites((prev) =>
      prev.includes(captainId) ? prev.filter((id) => id !== captainId) : [...prev, captainId]
    );
  };

  const isFavorite = (captainId: string) => favorites.includes(captainId);

  const recordContactClick = (captainId: string) => {
    setCaptains((prev) =>
      prev.map((c) => (c.id === captainId ? { ...c, contactClicks: c.contactClicks + 1 } : c))
    );
  };

  const recordProfileView = (captainId: string) => {
    setCaptains((prev) =>
      prev.map((c) => (c.id === captainId ? { ...c, profileViews: c.profileViews + 1 } : c))
    );
  };

  const submitReview = (captainId: string, customerName: string, rating: number, comment: string) => {
    soundFx.playSuccess();
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      captainId,
      customerName: customerName.trim() || 'Anonymous',
      rating,
      comment: comment.trim(),
      date: new Date().toISOString().split('T')[0],
    };
    setReviews((prev) => [newReview, ...prev]);
    setCaptains((prev) =>
      prev.map((c) => {
        if (c.id !== captainId) return c;
        const newCount = c.reviewCount + 1;
        const newRating = Number(((c.rating * c.reviewCount + rating) / newCount).toFixed(2));
        return { ...c, rating: newRating, reviewCount: newCount };
      })
    );
  };

  const registerCaptain = (input: CaptainRegistrationInput): Captain => {
    soundFx.playSuccess();
    const newCaptain: Captain = {
      id: `cap-${Date.now()}`,
      name: input.name,
      phone: input.phone,
      whatsapp: input.whatsapp,
      avatar: input.avatar,
      cityId: input.cityId,
      areas: input.areas,
      categories: input.categories,
      experienceYears: input.experienceYears,
      bio: input.bio,
      languages: input.languages,
      startingPrice: input.startingPrice,
      rating: 0,
      reviewCount: 0,
      isAvailable: true,
      kycStatus: 'pending' as KycStatus,
      aadhaarMasked: 'XXXX-XXXX-' + Math.floor(1000 + Math.random() * 8999),
      profileViews: 0,
      contactClicks: 0,
      createdAt: new Date().toISOString(),
    };
    setCaptains((prev) => [newCaptain, ...prev]);
    setActiveCaptainId(newCaptain.id);
    return newCaptain;
  };

  const updateCaptainProfile = (id: string, updates: Partial<Captain>) => {
    soundFx.playTap();
    setCaptains((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const toggleAvailability = (id: string) => {
    soundFx.playTap();
    setCaptains((prev) => prev.map((c) => (c.id === id ? { ...c, isAvailable: !c.isAvailable } : c)));
  };

  const approveCaptainKyc = (id: string) => {
    soundFx.playSuccess();
    setCaptains((prev) => prev.map((c) => (c.id === id ? { ...c, kycStatus: 'verified' } : c)));
  };

  const rejectCaptainKyc = (id: string) => {
    soundFx.playTap();
    setCaptains((prev) => prev.map((c) => (c.id === id ? { ...c, kycStatus: 'rejected' } : c)));
  };

  const toggleCategoryActive = (id: ServiceCategoryId) => {
    soundFx.playTap();
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)));
  };

  const addCategory = (title: string, iconName: string) => {
    soundFx.playSuccess();
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') as ServiceCategoryId;
    setCategories((prev) => [
      ...prev,
      { id, title, iconName, tagline: 'New category', color: 'from-slate-500 to-slate-700', isActive: true },
    ]);
  };

  const resetToDefault = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setCaptains(CAPTAINS);
    setCategories(SERVICE_CATEGORIES);
    setReviews(REVIEWS);
    setFavorites([]);
    setLanguage('en');
    setActiveCaptainId('cap-ravi');
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        language,
        setLanguage,
        t,
        customerTab,
        setCustomerTab,
        captainTab,
        setCaptainTab,
        adminTab,
        setAdminTab,
        selectedCity,
        setSelectedCity,
        allCities,
        searchQuery,
        setSearchQuery,
        categories,
        captains,
        reviews,
        favorites,
        activeCaptainId,
        setActiveCaptainId,
        currentCaptain,
        toggleFavorite,
        isFavorite,
        recordContactClick,
        recordProfileView,
        submitReview,
        registerCaptain,
        updateCaptainProfile,
        toggleAvailability,
        approveCaptainKyc,
        rejectCaptainKyc,
        toggleCategoryActive,
        addCategory,
        resetToDefault,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
