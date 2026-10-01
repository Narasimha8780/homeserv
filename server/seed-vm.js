// Run directly on the VM with mongosh, e.g.:
//   mongosh "mongodb://homeserv:qwerty@localhost:27017/homeservdb?authSource=homeservdb" seed-vm.js
// Safe to re-run — it clears these 4 collections first, then reinserts.

db.cities.deleteMany({});
db.categories.deleteMany({});
db.captains.deleteMany({});
db.reviews.deleteMany({});

db.cities.insertMany([
  { _id: 'jaipur', name: 'Jaipur', state: 'Rajasthan', population: '3.9M', tier: 'Tier 1', isActive: true, order: 1 },
  { _id: 'udaipur', name: 'Udaipur', state: 'Rajasthan', population: '0.5M', tier: 'Tier 2', isActive: true, order: 2 },
  { _id: 'jodhpur', name: 'Jodhpur', state: 'Rajasthan', population: '1.3M', tier: 'Tier 2', isActive: true, order: 3 },
]);

db.categories.insertMany([
  { _id: 'plumber', title: 'Plumber', iconName: 'Wrench', tagline: 'Pipes, leaks & fittings', color: 'from-blue-500 to-blue-700', isActive: true },
  { _id: 'electrician', title: 'Electrician', iconName: 'Zap', tagline: 'Wiring & repairs', color: 'from-amber-500 to-amber-700', isActive: true },
  { _id: 'carpenter', title: 'Carpenter', iconName: 'Hammer', tagline: 'Furniture & fittings', color: 'from-orange-500 to-orange-700', isActive: true },
  { _id: 'driver', title: 'Driver', iconName: 'Car', tagline: 'Local & outstation', color: 'from-emerald-500 to-emerald-700', isActive: true },
]);

db.captains.insertMany([
  {
    _id: 'cap-ravi',
    name: 'Ravi Kumar',
    phone: '+91 98290 11223',
    whatsapp: '+91 98290 11223',
    avatar: 'https://i.pravatar.cc/150?u=cap-ravi',
    cityId: 'jaipur',
    areas: ['Vaishali Nagar', 'Malviya Nagar'],
    categories: ['plumber'],
    experienceYears: 8,
    bio: 'Experienced plumber for home & office repairs.',
    languages: ['Hindi', 'English'],
    startingPrice: 150,
    rating: 4.6,
    reviewCount: 2,
    isAvailable: true,
    kycStatus: 'verified',
    profileViews: 0,
    contactClicks: 0,
  },
  {
    _id: 'cap-suresh',
    name: 'Suresh Sharma',
    phone: '+91 98290 33445',
    whatsapp: '+91 98290 33445',
    avatar: 'https://i.pravatar.cc/150?u=cap-suresh',
    cityId: 'jaipur',
    areas: ['C-Scheme', 'Civil Lines'],
    categories: ['electrician'],
    experienceYears: 5,
    bio: 'Licensed electrician, wiring and appliance repair.',
    languages: ['Hindi'],
    startingPrice: 200,
    rating: 4.3,
    reviewCount: 1,
    isAvailable: true,
    kycStatus: 'verified',
    profileViews: 0,
    contactClicks: 0,
  },
  {
    _id: 'cap-mahesh',
    name: 'Mahesh Yadav',
    phone: '+91 98290 55667',
    whatsapp: '+91 98290 55667',
    avatar: 'https://i.pravatar.cc/150?u=cap-mahesh',
    cityId: 'udaipur',
    areas: ['City Palace Road'],
    categories: ['carpenter', 'driver'],
    experienceYears: 10,
    bio: 'Custom furniture and outstation driving.',
    languages: ['Hindi', 'Rajasthani'],
    startingPrice: 300,
    rating: 4.8,
    reviewCount: 1,
    isAvailable: true,
    kycStatus: 'verified',
    profileViews: 0,
    contactClicks: 0,
  },
]);

db.reviews.insertMany([
  { _id: 'rev-1', captainId: 'cap-ravi', customerName: 'Anita Verma', rating: 5, comment: 'Fixed the leak quickly, very professional.', date: '2026-09-10' },
  { _id: 'rev-2', captainId: 'cap-ravi', customerName: 'Rohit Jain', rating: 4, comment: 'Good work, arrived a bit late.', date: '2026-09-15' },
  { _id: 'rev-3', captainId: 'cap-suresh', customerName: 'Priya Singh', rating: 4.3, comment: 'Rewired the whole kitchen, neat job.', date: '2026-09-20' },
  { _id: 'rev-4', captainId: 'cap-mahesh', customerName: 'Vikram Rathore', rating: 4.8, comment: 'Built a beautiful wardrobe for us.', date: '2026-09-22' },
]);

print('Seeded: ' + db.cities.countDocuments() + ' cities, ' + db.categories.countDocuments() + ' categories, ' + db.captains.countDocuments() + ' captains, ' + db.reviews.countDocuments() + ' reviews.');
