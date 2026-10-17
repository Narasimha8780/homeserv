import React, { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import type {
  AppRole,
  AppLanguage,
  AppTheme,
  City,
  ServiceCategory,
  ServiceCategoryId,
  Captain,
  Review,
  Customer,
  LgdRef,
} from '../types';
import { api } from '../utils/api';
import { translations } from '../i18n/translations';
import { soundFx } from '../utils/audio';
import { applyTheme, resolveTheme, type ResolvedTheme } from '../utils/theme';

export type OtpPurpose = 'signup' | 'reset';
export type AccountRole = 'customer' | 'captain';

// Proof that a number was just verified by OTP; sign-up and PIN reset take this
// token instead of a phone number.
export interface PhoneVerification {
  verificationToken: string;
  phone: string;
}

export interface OtpSendResult {
  mockOtp?: string;
  resendAfter?: number;
}

export interface CaptainRegistrationInput {
  name: string;
  pin: string;
  verificationToken: string;
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
  t: (key: string, vars?: Record<string, string | number>) => string;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  resolvedTheme: ResolvedTheme;

  customerTab: 'home' | 'favorites';
  setCustomerTab: (tab: 'home' | 'favorites') => void;
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;
  captainTab: 'dashboard' | 'reviews' | 'kyc';
  setCaptainTab: (tab: 'dashboard' | 'reviews' | 'kyc') => void;
  adminTab: 'overview' | 'kyc' | 'categories' | 'cities';
  setAdminTab: (tab: 'overview' | 'kyc' | 'categories' | 'cities') => void;

  selectedCity: City;
  setSelectedCity: (city: City) => void;
  allCities: City[];
  addCity: (name: string, state: string, lgd?: LgdRef) => Promise<City>;
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
  signUpCustomer: (name: string, pin: string, verificationToken: string) => Promise<Customer>;
  signInCustomer: (phone: string, pin: string) => Promise<Customer>;
  resetPinWithVerification: (verificationToken: string, pin: string, role?: AccountRole) => Promise<void>;
  signOutCustomer: () => void;

  toggleFavorite: (captainId: string) => void;
  isFavorite: (captainId: string) => boolean;
  recordContactClick: (captainId: string) => void;
  recordProfileView: (captainId: string) => void;
  submitReview: (captainId: string, customerName: string, rating: number, comment: string) => Promise<void>;

  registerCaptain: (input: CaptainRegistrationInput) => Promise<Captain>;
  sendOtp: (phone: string, purpose: OtpPurpose, role: AccountRole) => Promise<OtpSendResult>;
  verifyOtpCode: (phone: string, code: string) => Promise<PhoneVerification>;
  signInCaptain: (phone: string, pin: string) => Promise<Captain>;
  updateCaptainProfile: (id: string, updates: Partial<Captain>) => void;
  toggleAvailability: (id: string) => void;

  approveCaptainKyc: (id: string) => void;
  rejectCaptainKyc: (id: string) => void;
  toggleCategoryActive: (id: ServiceCategoryId) => void;
  addCategory: (title: string, iconName: string) => Promise<void>;
  toggleCityActive: (id: string) => void;

  resetToDefault: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const PREFS_KEY = 'homeserv_prefs_v1';

interface SavedPrefs {
  favorites?: string[];
  language?: AppLanguage;
  theme?: AppTheme;
  activeCaptainId?: string | null;
  currentCustomer?: Customer | null;
  selectedCityId?: string | null;
}

// Read once, synchronously, so the first render already has the saved values — loading them
// in an effect raced the "save prefs" effect, which could overwrite them with defaults.
function readPrefs(): SavedPrefs {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY) || '{}');
  } catch {
    return {};
  }
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [initialPrefs] = useState(readPrefs);
  const [role, setRole] = useState<AppRole>('customer');
  const [language, setLanguage] = useState<AppLanguage>(initialPrefs.language || 'en');
  const [theme, setTheme] = useState<AppTheme>(initialPrefs.theme || 'light');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolveTheme(theme));
  const [customerTab, setCustomerTab] = useState<'home' | 'favorites'>('home');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [captainTab, setCaptainTab] = useState<'dashboard' | 'reviews' | 'kyc'>('dashboard');
  const [adminTab, setAdminTab] = useState<'overview' | 'kyc' | 'categories' | 'cities'>('overview');

  const [allCities, setAllCities] = useState<City[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(initialPrefs.selectedCityId || null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [captains, setCaptains] = useState<Captain[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [favorites, setFavorites] = useState<string[]>(initialPrefs.favorites || []);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // No real login system exists yet, so "which captain is this device" is remembered
  // locally rather than defaulted to a shared demo account or picked from a list of
  // everyone else's profiles (that was a privacy leak — any visitor could browse and
  // view/edit any registered captain's private dashboard and KYC documents).
  const [activeCaptainId, setActiveCaptainId] = useState<string | null>(initialPrefs.activeCaptainId || null);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(initialPrefs.currentCustomer || null);

  useEffect(() => {
    try {
      localStorage.setItem(
        PREFS_KEY,
        JSON.stringify({ favorites, language, theme, activeCaptainId, currentCustomer, selectedCityId })
      );
    } catch {
      // ignore
    }
  }, [favorites, language, theme, activeCaptainId, currentCustomer, selectedCityId]);

  // Apply the theme, and keep following the OS setting while on "system".
  useEffect(() => {
    const update = () => {
      const resolved = resolveTheme(theme);
      setResolvedTheme(resolved);
      applyTheme(resolved);
    };
    update();
    if (theme !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: light)');
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

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
      setSelectedCityId(
        (prev) =>
          (prev && citiesRes.some((c) => c.id === prev) ? prev : null) ||
          citiesRes.find((c) => c.isActive)?.id ||
          citiesRes[0]?.id ||
          null
      );
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
  // Cities can come from outside the startup list (GPS lookup, a place someone just added),
  // so make sure the chosen one is in allCities before selecting it.
  const setSelectedCity = (city: City) => {
    setAllCities((prev) => (prev.some((c) => c.id === city.id) ? prev : [...prev, city]));
    setSelectedCityId(city.id);
  };

  const addCity = async (name: string, state: string, lgd?: LgdRef): Promise<City> => {
    const city = await api.post<City>('/cities', lgd ? { lgd } : { name, state });
    setAllCities((prev) => (prev.some((c) => c.id === city.id) ? prev : [...prev, city]));
    return city;
  };

  const currentCaptain = useMemo(
    () => captains.find((c) => c.id === activeCaptainId) || null,
    [captains, activeCaptainId]
  );

  const t = (key: string, vars?: Record<string, string | number>): string => {
    const langDict = translations[language] || translations.en;
    const text = langDict[key] || translations.en[key] || key;
    return vars ? text.replace(/\{(\w+)\}/g, (m, name) => (name in vars ? String(vars[name]) : m)) : text;
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

  const sendOtp = async (phone: string, purpose: OtpPurpose, role: AccountRole): Promise<OtpSendResult> =>
    api.post<OtpSendResult>('/auth/send-otp', { phone, purpose, role });

  const verifyOtpCode = async (phone: string, code: string): Promise<PhoneVerification> =>
    api.post<PhoneVerification>('/auth/otp/verify', { phone, code });

  const signUpCustomer = async (name: string, pin: string, verificationToken: string): Promise<Customer> => {
    const { customer } = await api.post<{ customer: Customer }>('/customers/signup', {
      name,
      pin,
      verificationToken,
    });
    soundFx.playSuccess();
    setCurrentCustomer(customer);
    return customer;
  };

  const signInCustomer = async (phone: string, pin: string): Promise<Customer> => {
    const { customer } = await api.post<{ customer: Customer }>('/customers/signin', { phone, pin });
    soundFx.playSuccess();
    setCurrentCustomer(customer);
    return customer;
  };

  const signInCaptain = async (phone: string, pin: string): Promise<Captain> => {
    const { captain } = await api.post<{ captain: Captain }>('/auth/captain/signin', { phone, pin });
    soundFx.playSuccess();
    setCaptains((prev) => (prev.some((c) => c.id === captain.id) ? prev : [captain, ...prev]));
    setActiveCaptainId(captain.id);
    return captain;
  };

  // They just proved they hold the number, so signing them straight in is safe.
  const resetPinWithVerification = async (
    verificationToken: string,
    pin: string,
    role: AccountRole = 'customer',
  ) => {
    if (role === 'captain') {
      const { captain } = await api.post<{ captain: Captain }>('/auth/captain/reset-pin', { verificationToken, pin });
      setCaptains((prev) => (prev.some((c) => c.id === captain.id) ? prev : [captain, ...prev]));
      setActiveCaptainId(captain.id);
    } else {
      const { customer } = await api.post<{ customer: Customer }>('/customers/reset-pin', { verificationToken, pin });
      setCurrentCustomer(customer);
    }
    soundFx.playSuccess();
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
    setTheme('dark');
    setSelectedCityId(null);
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
        theme,
        setTheme,
        resolvedTheme,
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
        signUpCustomer,
        signInCustomer,
        resetPinWithVerification,
        signOutCustomer,
        toggleFavorite,
        isFavorite,
        recordContactClick,
        recordProfileView,
        submitReview,
        registerCaptain,
        sendOtp,
        verifyOtpCode,
        signInCaptain,
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
