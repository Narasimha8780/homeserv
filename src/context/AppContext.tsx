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
  PickedPlace,
} from '../types';
import { api } from '../utils/api';
import { translations } from '../i18n/translations';
import { soundFx } from '../utils/audio';
import { applyTheme, resolveTheme, type ResolvedTheme } from '../utils/theme';

export interface CaptainRegistrationInput {
  name: string;
  phone: string;
  whatsapp: string;
  avatar: string;
  cityId?: City['id'];
  areas?: string[];
  serviceAreas?: { districtCode: number; wholeDistrict: boolean; subdistrictCodes: number[] }[];
  homePlace?: { subdistrictCode: number; villageCode?: number };
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
  selectedPlace: PickedPlace | null;
  setSelectedPlace: (place: PickedPlace | null) => void;
  allCities: City[];
  addCity: (name: string, state: string, lgd?: LgdRef) => Promise<City>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  categories: ServiceCategory[];
  captains: Captain[];
  reviews: Review[];
  favorites: string[];
  cityCounts: Record<string, number>;
  localTiers: LocalTiers | null;
  localLoading: boolean;
  loadReviews: (captainId: string) => Promise<void>;

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
  updateServiceAreas: (id: string, serviceAreas: CaptainRegistrationInput['serviceAreas']) => Promise<void>;

  approveCaptainKyc: (id: string) => void;
  rejectCaptainKyc: (id: string) => void;
  toggleCategoryActive: (id: ServiceCategoryId) => void;
  addCategory: (title: string, iconName: string) => Promise<void>;
  toggleCityActive: (id: string) => void;

  resetToDefault: () => void;
}

// Captain ids for the customer's place (mandal first, then district) or city, as returned by
// GET /api/captains/local. The captain objects themselves live in the `captains` cache.
export interface LocalTiers {
  key: string;
  mandal?: string[];
  district?: string[];
  city?: string[];
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
  selectedPlace?: PickedPlace | null;
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

// scope 'admin' (the admin console) loads every captain and review up front; the customer /
// captain app ('app') loads only what each screen shows.
export const AppProvider: React.FC<{ children: ReactNode; scope?: 'app' | 'admin' }> = ({ children, scope = 'app' }) => {
  const [initialPrefs] = useState(readPrefs);
  const [role, setRole] = useState<AppRole>('customer');
  const [language, setLanguage] = useState<AppLanguage>(initialPrefs.language || 'en');
  const [theme, setTheme] = useState<AppTheme>(initialPrefs.theme || 'dark');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolveTheme(theme));
  const [customerTab, setCustomerTab] = useState<'home' | 'favorites'>('home');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [captainTab, setCaptainTab] = useState<'dashboard' | 'reviews' | 'kyc'>('dashboard');
  const [adminTab, setAdminTab] = useState<'overview' | 'kyc' | 'categories' | 'cities'>('overview');

  const [allCities, setAllCities] = useState<City[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(initialPrefs.selectedCityId || null);
  const [selectedPlace, setSelectedPlace] = useState<PickedPlace | null>(initialPrefs.selectedPlace || null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [captains, setCaptains] = useState<Captain[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [cityCounts, setCityCounts] = useState<Record<string, number>>({});
  const [localTiers, setLocalTiers] = useState<LocalTiers | null>(null);

  // Upsert fetched captains into the shared cache (keeps live edits like contact counts).
  const mergeCaptains = (list: Captain[]) =>
    setCaptains((prev) => {
      const byId = new Map(prev.map((c) => [c.id, c]));
      list.forEach((c) => byId.set(c.id, { ...byId.get(c.id), ...c }));
      return [...byId.values()];
    });
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
        JSON.stringify({ favorites, language, theme, activeCaptainId, currentCustomer, selectedCityId, selectedPlace })
      );
    } catch {
      // ignore
    }
  }, [favorites, language, theme, activeCaptainId, currentCustomer, selectedCityId, selectedPlace]);

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
      const [citiesRes, categoriesRes] = await Promise.all([
        api.get<City[]>('/cities'),
        api.get<ServiceCategory[]>('/categories'),
      ]);
      setAllCities(citiesRes);
      setCategories(categoriesRes);
      if (scope === 'admin') {
        const [captainsRes, reviewsRes] = await Promise.all([api.get<Captain[]>('/captains'), api.get<Review[]>('/reviews')]);
        setCaptains(captainsRes);
        setReviews(reviewsRes);
      } else {
        // Only this device's own captain profile and saved favourites; nearby pros load per place.
        const [counts, own, favs] = await Promise.all([
          api.get<{ cityId: string; count: number }[]>('/captains/stats/cities'),
          activeCaptainId ? api.get<Captain>(`/captains/${activeCaptainId}`).catch(() => null) : null,
          favorites.length ? api.get<Captain[]>(`/captains/by-ids?ids=${favorites.join(',')}`) : [],
        ]);
        setCityCounts(Object.fromEntries(counts.map((r) => [r.cityId, r.count])));
        setCaptains([...(own ? [own] : []), ...favs.filter((c) => c.id !== own?.id)]);
        setReviews([]);
        setLocalTiers(null);
      }
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

  // Fetch the pros for the customer's place (or city) whenever it changes.
  const localKey =
    scope === 'admin' || isLoading || loadError
      ? null
      : selectedPlace
      ? `d:${selectedPlace.district.code}|sd:${selectedPlace.subdistrict.code}|c:${selectedCityId}`
      : selectedCityId
      ? `c:${selectedCityId}`
      : null;
  useEffect(() => {
    if (!localKey) return;
    let cancelled = false;
    (async () => {
      try {
        let tiers: LocalTiers = { key: localKey };
        if (selectedPlace) {
          const r = await api.get<{ mandal: Captain[]; district: Captain[] }>(
            `/captains/local?district=${selectedPlace.district.code}&subdistrict=${selectedPlace.subdistrict.code}`
          );
          if (cancelled) return;
          mergeCaptains([...r.mandal, ...r.district]);
          tiers = { ...tiers, mandal: r.mandal.map((c) => c.id), district: r.district.map((c) => c.id) };
        }
        if (!tiers.mandal?.length && !tiers.district?.length && selectedCityId) {
          // No place chosen, or nobody serves the district yet: the city's pros.
          const r = await api.get<{ city: Captain[] }>(`/captains/local?city=${encodeURIComponent(selectedCityId)}`);
          if (cancelled) return;
          mergeCaptains(r.city);
          tiers = { ...tiers, city: r.city.map((c) => c.id) };
        }
        if (!cancelled) setLocalTiers(tiers);
      } catch {
        if (!cancelled) setLocalTiers({ key: localKey });
      }
    })();
    return () => {
      cancelled = true;
    };
    // selectedPlace/selectedCityId are captured through localKey
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localKey]);
  const localLoading = !!localKey && localTiers?.key !== localKey;

  const loadReviews = async (captainId: string) => {
    const list = await api.get<Review[]>(`/reviews?captainId=${encodeURIComponent(captainId)}`);
    setReviews((prev) => [...prev.filter((r) => r.captainId !== captainId), ...list]);
  };

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

  // Validated and normalised by the server, so wait for its copy rather than updating optimistically.
  const updateServiceAreas = async (id: string, serviceAreas: CaptainRegistrationInput['serviceAreas']) => {
    const captain = await api.patch<Captain>(`/captains/${id}`, { serviceAreas });
    soundFx.playSuccess();
    setCaptains((prev) => prev.map((c) => (c.id === id ? captain : c)));
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
    setSelectedPlace(null);
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
        selectedPlace,
        setSelectedPlace,
        allCities,
        addCity,
        searchQuery,
        setSearchQuery,
        categories,
        captains,
        reviews,
        favorites,
        cityCounts,
        localTiers: localTiers?.key === localKey ? localTiers : null,
        localLoading,
        loadReviews,
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
        updateServiceAreas,
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
