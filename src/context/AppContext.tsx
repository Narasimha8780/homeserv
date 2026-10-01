import React, { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import type {
  AppRole,
  AppLanguage,
  City,
  ServiceCategory,
  ServiceCategoryId,
  Captain,
  Review,
  Customer,
} from '../types';
import { api } from '../utils/api';
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
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;
  captainTab: 'dashboard' | 'reviews' | 'kyc';
  setCaptainTab: (tab: 'dashboard' | 'reviews' | 'kyc') => void;
  adminTab: 'overview' | 'kyc' | 'categories' | 'cities';
  setAdminTab: (tab: 'overview' | 'kyc' | 'categories' | 'cities') => void;

  selectedCity: City;
  setSelectedCity: (city: City) => void;
  allCities: City[];
  addCity: (name: string, state: string) => Promise<City>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  categories: ServiceCategory[];
  captains: Captain[];
  reviews: Review[];
  favorites: string[];

  isLoading: boolean;
  loadError: string | null;

  activeCaptainId: string | null;
  setActiveCaptainId: (id: string | null) => void;
  currentCaptain: Captain | null;

  currentCustomer: Customer | null;
  verifyCustomerOtp: (phone: string, code: string, name?: string) => Promise<Customer | null>;
  completeCustomerSignup: (name: string, phone: string) => Promise<Customer>;
  signOutCustomer: () => void;

  toggleFavorite: (captainId: string) => void;
  isFavorite: (captainId: string) => boolean;
  recordContactClick: (captainId: string) => void;
  recordProfileView: (captainId: string) => void;
  submitReview: (captainId: string, customerName: string, rating: number, comment: string) => Promise<void>;

  registerCaptain: (input: CaptainRegistrationInput) => Promise<Captain>;
  sendOtp: (phone: string) => Promise<{ mockOtp?: string }>;
  verifyOtp: (phone: string, code: string) => Promise<Captain | null>;
  updateCaptainProfile: (id: string, updates: Partial<Captain>) => void;
  toggleAvailability: (id: string) => void;

  approveCaptainKyc: (id: string) => void;
  rejectCaptainKyc: (id: string) => void;
  toggleCategoryActive: (id: ServiceCategoryId) => void;
  addCategory: (title: string, iconName: string) => void;
  toggleCityActive: (id: string) => void;

  resetToDefault: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const PREFS_KEY = 'homeserv_prefs_v1';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<AppRole>('customer');
  const [language, setLanguage] = useState<AppLanguage>('en');
  const [customerTab, setCustomerTab] = useState<'home' | 'favorites' | 'more'>('home');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [captainTab, setCaptainTab] = useState<'dashboard' | 'reviews' | 'kyc'>('dashboard');
  const [adminTab, setAdminTab] = useState<'overview' | 'kyc' | 'categories' | 'cities'>('overview');

  const [allCities, setAllCities] = useState<City[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [captains, setCaptains] = useState<Captain[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // No real login system exists yet, so "which captain is this device" is remembered
  // locally rather than defaulted to a shared demo account or picked from a list of
  // everyone else's profiles (that was a privacy leak — any visitor could browse and
  // view/edit any registered captain's private dashboard and KYC documents).
  const [activeCaptainId, setActiveCaptainId] = useState<string | null>(null);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);

  // Load device-local preferences (favorites, language, which captain/customer this device is)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PREFS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.favorites) setFavorites(parsed.favorites);
        if (parsed.language) setLanguage(parsed.language);
        if (parsed.activeCaptainId) setActiveCaptainId(parsed.activeCaptainId);
        if (parsed.currentCustomer) setCurrentCustomer(parsed.currentCustomer);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({ favorites, language, activeCaptainId, currentCustomer }));
    } catch {
      // ignore
    }
  }, [favorites, language, activeCaptainId, currentCustomer]);

  // Load all data from the API on startup
  const loadAll = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [citiesRes, categoriesRes, captainsRes, reviewsRes] = await Promise.all([
        api.get<City[]>('/cities'),
        api.get<ServiceCategory[]>('/categories'),
        api.get<Captain[]>('/captains'),
        api.get<Review[]>('/reviews'),
      ]);
      setAllCities(citiesRes);
      setCategories(categoriesRes);
      setCaptains(captainsRes);
      setReviews(reviewsRes);
      setSelectedCityId((prev) => prev || citiesRes.find((c) => c.isActive)?.id || citiesRes[0]?.id || null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedCity = useMemo(
    () => allCities.find((c) => c.id === selectedCityId) || allCities[0],
    [allCities, selectedCityId]
  );
  const setSelectedCity = (city: City) => setSelectedCityId(city.id);

  const addCity = async (name: string, state: string): Promise<City> => {
    const city = await api.post<City>('/cities', { name, state });
    setAllCities((prev) => (prev.some((c) => c.id === city.id) ? prev : [...prev, city]));
    return city;
  };

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
    api.patch(`/captains/${captainId}/contact`, {}).catch(() => {});
  };

  const recordProfileView = (captainId: string) => {
    setCaptains((prev) =>
      prev.map((c) => (c.id === captainId ? { ...c, profileViews: c.profileViews + 1 } : c))
    );
    api.patch(`/captains/${captainId}/view`, {}).catch(() => {});
  };

  const submitReview = async (captainId: string, customerName: string, rating: number, comment: string) => {
    const { review, captain } = await api.post<{ review: Review; captain: Captain }>('/reviews', {
      captainId,
      customerName,
      rating,
      comment,
    });
    soundFx.playSuccess();
    setReviews((prev) => [review, ...prev]);
    setCaptains((prev) => prev.map((c) => (c.id === captainId ? captain : c)));
  };

  const registerCaptain = async (input: CaptainRegistrationInput): Promise<Captain> => {
    const captain = await api.post<Captain>('/captains', input);
    soundFx.playSuccess();
    setCaptains((prev) => [captain, ...prev]);
    setActiveCaptainId(captain.id);
    return captain;
  };

  const sendOtp = async (phone: string): Promise<{ mockOtp?: string }> => {
    return api.post<{ success: boolean; mockOtp?: string }>('/auth/send-otp', { phone });
  };

  const verifyOtp = async (phone: string, code: string): Promise<Captain | null> => {
    const { captain } = await api.post<{ verified: boolean; captain: Captain | null }>('/auth/verify-otp', {
      phone,
      code,
    });
    if (captain) {
      soundFx.playSuccess();
      setCaptains((prev) => (prev.some((c) => c.id === captain.id) ? prev : [captain, ...prev]));
      setActiveCaptainId(captain.id);
    }
    return captain;
  };

  const verifyCustomerOtp = async (phone: string, code: string, name?: string): Promise<Customer | null> => {
    const { customer } = await api.post<{ verified: boolean; customer: Customer | null }>('/customers/verify-otp', {
      phone,
      code,
      name,
    });
    if (customer) {
      soundFx.playSuccess();
      setCurrentCustomer(customer);
    }
    return customer;
  };

  const completeCustomerSignup = async (name: string, phone: string): Promise<Customer> => {
    const customer = await api.post<Customer>('/customers', { name, phone });
    soundFx.playSuccess();
    setCurrentCustomer(customer);
    return customer;
  };

  const signOutCustomer = () => {
    setCurrentCustomer(null);
  };

  const updateCaptainProfile = (id: string, updates: Partial<Captain>) => {
    soundFx.playTap();
    setCaptains((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    api.patch(`/captains/${id}`, updates).catch(() => {});
  };

  const toggleAvailability = (id: string) => {
    soundFx.playTap();
    const current = captains.find((c) => c.id === id);
    if (!current) return;
    const isAvailable = !current.isAvailable;
    setCaptains((prev) => prev.map((c) => (c.id === id ? { ...c, isAvailable } : c)));
    api.patch(`/captains/${id}`, { isAvailable }).catch(() => {});
  };

  const approveCaptainKyc = (id: string) => {
    soundFx.playSuccess();
    setCaptains((prev) => prev.map((c) => (c.id === id ? { ...c, kycStatus: 'verified' } : c)));
    api.patch(`/captains/${id}`, { kycStatus: 'verified' }).catch(() => {});
  };

  const rejectCaptainKyc = (id: string) => {
    soundFx.playTap();
    setCaptains((prev) => prev.map((c) => (c.id === id ? { ...c, kycStatus: 'rejected' } : c)));
    api.patch(`/captains/${id}`, { kycStatus: 'rejected' }).catch(() => {});
  };

  const toggleCategoryActive = (id: ServiceCategoryId) => {
    soundFx.playTap();
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)));
    api.patch(`/categories/${id}/toggle`, {}).catch(() => {});
  };

  const toggleCityActive = (id: string) => {
    soundFx.playTap();
    setAllCities((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)));
    api.patch(`/cities/${id}/toggle`, {}).catch(() => {});
  };

  const addCategory = async (title: string, iconName: string) => {
    const category = await api.post<ServiceCategory>('/categories', { title, iconName });
    soundFx.playSuccess();
    setCategories((prev) => [...prev, category]);
  };

  const resetToDefault = () => {
    localStorage.removeItem(PREFS_KEY);
    setFavorites([]);
    setLanguage('en');
    setActiveCaptainId(null);
    setCurrentCustomer(null);
    loadAll();
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
        selectedCategoryId,
        setSelectedCategoryId,
        captainTab,
        setCaptainTab,
        adminTab,
        setAdminTab,
        selectedCity,
        setSelectedCity,
        allCities,
        addCity,
        searchQuery,
        setSearchQuery,
        categories,
        captains,
        reviews,
        favorites,
        isLoading,
        loadError,
        activeCaptainId,
        setActiveCaptainId,
        currentCaptain,
        currentCustomer,
        verifyCustomerOtp,
        completeCustomerSignup,
        signOutCustomer,
        toggleFavorite,
        isFavorite,
        recordContactClick,
        recordProfileView,
        submitReview,
        registerCaptain,
        sendOtp,
        verifyOtp,
        updateCaptainProfile,
        toggleAvailability,
        approveCaptainKyc,
        rejectCaptainKyc,
        toggleCategoryActive,
        addCategory,
        toggleCityActive,
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
