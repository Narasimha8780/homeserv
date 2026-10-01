export type CityId = string;

export interface City {
  id: CityId;
  name: string;
  state: string;
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
  | 'pest-control';

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
