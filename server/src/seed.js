import 'dotenv/config';
import { connectDB } from './db.js';
import { City } from './models/City.js';
import { Category } from './models/Category.js';
import { Captain } from './models/Captain.js';
import { Review } from './models/Review.js';
import { INDIA_CITIES } from './data/indiaCities.js';
import { normalizePhone } from './utils/phone.js';
import mongoose from 'mongoose';

function slugify(str) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Rough population bands by tier — the official city list only classifies tiers, not
// exact population figures, so this is a readable placeholder rather than precise data.
const POPULATION_BY_TIER = {
  'Tier 1': '5M+',
  'Tier 2': '0.5M - 2M',
  'Tier 3': '<0.5M',
};

function buildCities() {
  // Jaipur, Rajasthan first (matches the app's long-standing default city); everything
  // else keeps its original relative order from INDIA_CITIES (stable sort).
  const sorted = [...INDIA_CITIES].sort((a, b) => {
    const aIsJaipur = a.name === 'Jaipur' && a.state === 'Rajasthan';
    const bIsJaipur = b.name === 'Jaipur' && b.state === 'Rajasthan';
    if (aIsJaipur === bIsJaipur) return 0;
    return aIsJaipur ? -1 : 1;
  });
  return sorted.map((c, idx) => ({
    id: `${slugify(c.name)}-${slugify(c.state)}`,
    name: c.name,
    state: c.state,
    population: c.population || POPULATION_BY_TIER[c.tier] || 'N/A',
    tier: c.tier,
    isActive: true,
    order: idx + 1,
  }));
}

const CITIES = buildCities();

const CATEGORIES = [
  { id: 'electrician', title: 'Electrician', iconName: 'Zap', tagline: 'Wiring, switches, MCB, fan & inverter fitting', color: 'from-amber-500 to-orange-600', isActive: true },
  { id: 'plumber', title: 'Plumber', iconName: 'Wrench', tagline: 'Tap leaks, pipe fitting, tank & bathroom work', color: 'from-cyan-500 to-blue-600', isActive: true },
  { id: 'driver', title: 'Driver', iconName: 'Car', tagline: 'Daily commute, outstation trips, events', color: 'from-slate-600 to-slate-800', isActive: true },
  { id: 'carpenter', title: 'Carpenter', iconName: 'Hammer', tagline: 'Furniture repair, doors, locks, custom woodwork', color: 'from-amber-700 to-amber-900', isActive: true },
  { id: 'painter', title: 'Painter', iconName: 'Paintbrush', tagline: 'Room painting, texture work, waterproofing', color: 'from-rose-500 to-pink-600', isActive: true },
  { id: 'ac-repair', title: 'AC Repair', iconName: 'Fan', tagline: 'Cooling checks, gas refill, installation', color: 'from-blue-500 to-indigo-600', isActive: true },
  { id: 'appliance-repair', title: 'Appliance Repair', iconName: 'Tv', tagline: 'Washing machines, fridges, microwaves', color: 'from-purple-500 to-indigo-600', isActive: true },
  { id: 'pest-control', title: 'Pest Control', iconName: 'ShieldAlert', tagline: 'Cockroach, termite & bedbug treatment', color: 'from-teal-600 to-cyan-700', isActive: true },
];

const CAPTAINS = [
  { id: 'cap-ravi', name: 'Ravi Kumar', phone: '+91 98290 12345', whatsapp: '919829012345', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80', cityId: 'jaipur-rajasthan', areas: ['Vaishali Nagar', 'Malviya Nagar'], categories: ['electrician'], experienceYears: 5, bio: 'House wiring, MCB tripping, fan & inverter installation. Same-day visits in Vaishali Nagar.', languages: ['Hindi', 'English'], startingPrice: 149, rating: 4.9, reviewCount: 3, isAvailable: true, kycStatus: 'verified', aadhaarMasked: 'XXXX-XXXX-8921', aadhaarDocUrl: 'https://images.unsplash.com/photo-1633409302455-58e18bb43c44?w=600&auto=format&fit=crop&q=80', skillCertUrl: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600&auto=format&fit=crop&q=80', profileViews: 482, contactClicks: 61 },
  { id: 'cap-suresh', name: 'Suresh Verma', phone: '+91 94140 76543', whatsapp: '919414076543', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80', cityId: 'jaipur-rajasthan', areas: ['C-Scheme', 'Raja Park'], categories: ['electrician', 'appliance-repair'], experienceYears: 7, bio: 'Electrician and appliance technician. Washing machine, fridge and AC electrical faults handled.', languages: ['Hindi', 'English', 'Marwari'], startingPrice: 199, rating: 4.8, reviewCount: 2, isAvailable: true, kycStatus: 'verified', aadhaarMasked: 'XXXX-XXXX-3419', profileViews: 356, contactClicks: 44 },
  { id: 'cap-anita', name: 'Anita Sharma', phone: '+91 99280 43210', whatsapp: '919928043210', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80', cityId: 'jaipur-rajasthan', areas: ['Vaishali Nagar', 'Ajmer Road'], categories: ['pest-control'], experienceYears: 4, bio: 'Chemical-free cockroach and termite treatment for homes. 90-day guarantee on service.', languages: ['Hindi'], startingPrice: 449, rating: 4.95, reviewCount: 2, isAvailable: true, kycStatus: 'verified', aadhaarMasked: 'XXXX-XXXX-6671', profileViews: 298, contactClicks: 39 },
  { id: 'cap-manish', name: 'Manish Saini', phone: '+91 88901 54321', whatsapp: '918890154321', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', cityId: 'jaipur-rajasthan', areas: ['Mansarovar'], categories: ['plumber'], experienceYears: 3, bio: 'Tap leaks, drain cleaning, bathroom fittings. Available all days.', languages: ['Hindi'], startingPrice: 129, rating: 0, reviewCount: 0, isAvailable: false, kycStatus: 'pending', aadhaarMasked: 'XXXX-XXXX-1144', aadhaarDocUrl: 'https://images.unsplash.com/photo-1633409302455-58e18bb43c44?w=600&auto=format&fit=crop&q=80', skillCertUrl: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600&auto=format&fit=crop&q=80', profileViews: 0, contactClicks: 0 },
  { id: 'cap-deepak', name: 'Deepak Yadav', phone: '+91 97831 22110', whatsapp: '919783122110', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80', cityId: 'jaipur-rajasthan', areas: ['Malviya Nagar', 'Tonk Road'], categories: ['driver'], experienceYears: 6, bio: 'Experienced driver for daily office commute, outstation trips and weddings. Own car available.', languages: ['Hindi'], startingPrice: 500, rating: 4.7, reviewCount: 2, isAvailable: true, kycStatus: 'verified', aadhaarMasked: 'XXXX-XXXX-5502', profileViews: 210, contactClicks: 28 },
  { id: 'cap-rajesh', name: 'Rajesh Singh', phone: '+91 96210 88332', whatsapp: '919621088332', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80', cityId: 'lucknow-uttar-pradesh', areas: ['Hazratganj', 'Aliganj'], categories: ['carpenter'], experienceYears: 8, bio: 'Custom furniture, door and window repair, modular kitchen fitting.', languages: ['Hindi'], startingPrice: 179, rating: 4.85, reviewCount: 2, isAvailable: true, kycStatus: 'verified', aadhaarMasked: 'XXXX-XXXX-7743', profileViews: 265, contactClicks: 31 },
  { id: 'cap-vikram', name: 'Vikram Mehta', phone: '+91 95001 44210', whatsapp: '919500144210', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80', cityId: 'lucknow-uttar-pradesh', areas: ['Gomti Nagar'], categories: ['painter'], experienceYears: 5, bio: 'Interior and exterior painting, waterproofing and texture designs.', languages: ['Hindi', 'English'], startingPrice: 2499, rating: 4.6, reviewCount: 1, isAvailable: true, kycStatus: 'verified', aadhaarMasked: 'XXXX-XXXX-9012', profileViews: 145, contactClicks: 17 },
  { id: 'cap-prakash', name: 'Prakash Joshi', phone: '+91 93012 77641', whatsapp: '919301277641', avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&auto=format&fit=crop&q=80', cityId: 'indore-madhya-pradesh', areas: ['Vijay Nagar', 'Palasia'], categories: ['ac-repair'], experienceYears: 6, bio: 'Split & window AC service, gas refilling and new installation.', languages: ['Hindi'], startingPrice: 449, rating: 4.88, reviewCount: 3, isAvailable: true, kycStatus: 'verified', aadhaarMasked: 'XXXX-XXXX-4498', profileViews: 320, contactClicks: 42 },
  { id: 'cap-sanjay', name: 'Sanjay Patel', phone: '+91 90585 33201', whatsapp: '919058533201', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80', cityId: 'indore-madhya-pradesh', areas: ['Palasia'], categories: ['plumber'], experienceYears: 4, bio: 'Bathroom fittings, water tank cleaning, pipeline leak repair.', languages: ['Hindi'], startingPrice: 129, rating: 4.75, reviewCount: 1, isAvailable: true, kycStatus: 'verified', aadhaarMasked: 'XXXX-XXXX-3357', profileViews: 132, contactClicks: 19 },
  { id: 'cap-karthik', name: 'Karthik Raman', phone: '+91 89392 10087', whatsapp: '918939210087', avatar: 'https://images.unsplash.com/photo-1615109398623-88346a601842?w=400&auto=format&fit=crop&q=80', cityId: 'coimbatore-tamil-nadu', areas: ['RS Puram', 'Peelamedu'], categories: ['electrician'], experienceYears: 5, bio: 'Home and shop wiring, switchboard repair, ceiling fan installation.', languages: ['Tamil', 'English'], startingPrice: 149, rating: 4.9, reviewCount: 2, isAvailable: true, kycStatus: 'verified', aadhaarMasked: 'XXXX-XXXX-6620', profileViews: 240, contactClicks: 33 },
  { id: 'cap-muthu', name: 'Muthu Selvam', phone: '+91 88705 61239', whatsapp: '918870561239', avatar: 'https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=400&auto=format&fit=crop&q=80', cityId: 'coimbatore-tamil-nadu', areas: ['Gandhipuram'], categories: ['driver'], experienceYears: 9, bio: 'Long-distance and daily driver, familiar with Coimbatore and Ooty routes.', languages: ['Tamil'], startingPrice: 500, rating: 4.82, reviewCount: 2, isAvailable: true, kycStatus: 'verified', aadhaarMasked: 'XXXX-XXXX-2287', profileViews: 190, contactClicks: 24 },
  { id: 'cap-imran', name: 'Imran Khan', phone: '+91 78290 99001', whatsapp: '917829099001', avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&auto=format&fit=crop&q=80', cityId: 'bhopal-madhya-pradesh', areas: ['MP Nagar'], categories: ['ac-repair', 'appliance-repair'], experienceYears: 4, bio: 'AC and appliance repair specialist, home visits within the day.', languages: ['Hindi', 'Urdu'], startingPrice: 249, rating: 0, reviewCount: 0, isAvailable: false, kycStatus: 'pending', aadhaarMasked: 'XXXX-XXXX-8804', aadhaarDocUrl: 'https://images.unsplash.com/photo-1633409302455-58e18bb43c44?w=600&auto=format&fit=crop&q=80', skillCertUrl: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600&auto=format&fit=crop&q=80', profileViews: 0, contactClicks: 0 },
];

const REVIEWS = [
  { id: 'rev-1', captainId: 'cap-ravi', customerName: 'Priya Sharma', rating: 5, comment: 'Fixed the MCB tripping issue in 20 minutes. Very professional and on time.', date: '2026-08-10' },
  { id: 'rev-2', captainId: 'cap-ravi', customerName: 'Anil Gupta', rating: 5, comment: 'Reliable, fair pricing. Have used him twice now.', date: '2026-06-02' },
  { id: 'rev-3', captainId: 'cap-ravi', customerName: 'Neha Jain', rating: 4, comment: 'Good work, slightly delayed arrival.', date: '2026-03-18' },
  { id: 'rev-4', captainId: 'cap-suresh', customerName: 'Rakesh Ojha', rating: 5, comment: 'Fixed my fridge compressor issue quickly.', date: '2026-07-01' },
  { id: 'rev-5', captainId: 'cap-suresh', customerName: 'Sunita Rathi', rating: 4.5, comment: 'Knows his work well, polite behaviour.', date: '2026-04-22' },
  { id: 'rev-6', captainId: 'cap-anita', customerName: 'Priya Sharma', rating: 5, comment: 'No cockroaches since treatment 3 months ago. Highly recommend.', date: '2026-05-14' },
  { id: 'rev-7', captainId: 'cap-anita', customerName: 'Meena Kumari', rating: 4.9, comment: 'Odourless gel treatment worked great for kitchen.', date: '2026-02-09' },
  { id: 'rev-8', captainId: 'cap-deepak', customerName: 'Sandeep Rao', rating: 4.5, comment: 'Safe driver, used for an outstation trip to Udaipur.', date: '2026-07-19' },
  { id: 'rev-9', captainId: 'cap-deepak', customerName: 'Kavita Singh', rating: 5, comment: 'On time every single day for my daily office commute.', date: '2026-05-01' },
  { id: 'rev-10', captainId: 'cap-rajesh', customerName: 'Ramesh Tiwari', rating: 5, comment: 'Excellent modular kitchen work, finished in 2 days.', date: '2026-06-28' },
  { id: 'rev-11', captainId: 'cap-rajesh', customerName: 'Alok Verma', rating: 4.7, comment: 'Repaired my old wooden door frame nicely.', date: '2026-03-05' },
  { id: 'rev-12', captainId: 'cap-vikram', customerName: 'Shalini Dubey', rating: 4.6, comment: 'Neat painting work, cleaned up after finishing.', date: '2026-04-30' },
  { id: 'rev-13', captainId: 'cap-prakash', customerName: 'Rohit Malviya', rating: 5, comment: 'Gas refill done professionally, cooling is perfect now.', date: '2026-07-11' },
  { id: 'rev-14', captainId: 'cap-prakash', customerName: 'Deepa Agrawal', rating: 4.8, comment: 'Installed a new split AC, very neat cabling.', date: '2026-05-20' },
  { id: 'rev-15', captainId: 'cap-prakash', customerName: 'Manoj Shukla', rating: 4.9, comment: 'Quick response, fixed cooling issue same day.', date: '2026-02-14' },
  { id: 'rev-16', captainId: 'cap-sanjay', customerName: 'Vinita Chouhan', rating: 4.75, comment: 'Fixed the bathroom leak permanently.', date: '2026-06-09' },
  { id: 'rev-17', captainId: 'cap-karthik', customerName: 'Lakshmi Narayan', rating: 5, comment: 'Rewired my shop safely, very knowledgeable.', date: '2026-08-02' },
  { id: 'rev-18', captainId: 'cap-karthik', customerName: 'Suresh Babu', rating: 4.8, comment: 'Fixed fan wiring issue quickly and safely.', date: '2026-04-16' },
  { id: 'rev-19', captainId: 'cap-muthu', customerName: 'Divya Ramesh', rating: 5, comment: 'Excellent driver for our Ooty trip, very careful on ghat roads.', date: '2026-07-25' },
  { id: 'rev-20', captainId: 'cap-muthu', customerName: 'Ganesh Kumar', rating: 4.65, comment: 'Punctual daily driver, good with kids in the car.', date: '2026-05-08' },
];

function withMongoId(arr) {
  return arr.map(({ id, ...rest }) => ({ _id: id, ...rest }));
}

async function seed() {
  await connectDB();

  await Promise.all([
    City.deleteMany({}),
    Category.deleteMany({}),
    Captain.deleteMany({}),
    Review.deleteMany({}),
  ]);

  await City.insertMany(withMongoId(CITIES));
  await Category.insertMany(withMongoId(CATEGORIES));
  await Captain.insertMany(
    withMongoId(CAPTAINS).map((c) => ({ ...c, phoneNormalized: normalizePhone(c.phone) }))
  );
  await Review.insertMany(withMongoId(REVIEWS));

  console.log(`Seeded ${CITIES.length} cities, ${CATEGORIES.length} categories, ${CAPTAINS.length} captains, ${REVIEWS.length} reviews.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
