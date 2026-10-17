export type CityId = string;

export interface City {
  id: CityId;
  name: string;
  state: string;
  district?: string;
  population: string;
  tier: string;
  isActive: boolean;
}

export type ServiceCategoryId =
  | 'electrician'
  | 'plumber'
  | 'driver'
  | 'carpenter'
  | 'painter'
  | 'ac-repair'
  | 'appliance-repair'
  | 'pest-control'
  | 'insta-help'
  | 'saree-draping'
  | 'mehendi-service'
  | 'spa'
  | 'interior'
  | 'home-cleaning'
  | 'bridal-makeup'
  | 'photography'
  | 'events';

export interface ServiceCategory {
  id: ServiceCategoryId;
  title: string;
  iconName: string;
  tagline: string;
  color: string;
  isActive: boolean;
}

export type KycStatus = 'verified' | 'pending' | 'rejected';
export type AppRole = 'customer' | 'captain';
export type AppLanguage = 'en' | 'hi' | 'ta' | 'te' | 'mr' | 'bn';
export type AppTheme = 'dark' | 'light' | 'system';

export interface Captain {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  avatar: string;
  cityId: CityId;
  areas: string[];
  categories: ServiceCategoryId[];
  experienceYears: number;
  bio: string;
  languages: string[];
  startingPrice?: number;
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  kycStatus: KycStatus;
  aadhaarMasked: string;
  aadhaarDocUrl?: string;
  skillCertUrl?: string;
  profileViews: number;
  contactClicks: number;
  createdAt: string;
}

export interface Review {
  id: string;
  captainId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
}

// Official LGD (Local Government Directory) places, used by the city picker and GPS lookup.
export type LgdPlaceType = 'district' | 'subdistrict' | 'village';

export interface LgdRef {
  type: LgdPlaceType;
  code: number;
}

export interface LgdPlace extends LgdRef {
  name: string;
  state: string;
  district?: string;
  subdistrict?: string;
}

export interface NearestResult {
  area: {
    subdistrict: string;
    district: string;
    state: string;
    subdistrictCode: number;
    districtCode: number;
    approx: boolean;
    distanceKm: number;
  } | null;
  cities: { city: City; distanceKm: number }[];
}
