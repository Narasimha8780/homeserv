import mongoose from 'mongoose';

const captainSchema = new mongoose.Schema(
  {
    _id: { type: String },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    phoneNormalized: { type: String, required: true, index: true },
    whatsapp: { type: String, required: true },
    avatar: { type: String, required: true },
    cityId: { type: String, required: true },
    areas: { type: [String], default: [] },
    categories: { type: [String], default: [] },
    experienceYears: { type: Number, default: 0 },
    bio: { type: String, default: '' },
    languages: { type: [String], default: [] },
    startingPrice: { type: Number },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    kycStatus: { type: String, enum: ['verified', 'pending', 'rejected'], default: 'pending' },
    aadhaarMasked: { type: String, default: '' },
    aadhaarDocUrl: { type: String },
    skillCertUrl: { type: String },
    profileViews: { type: Number, default: 0 },
    contactClicks: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false }, versionKey: false }
);

captainSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.phoneNormalized;
  },
});

export const Captain = mongoose.model('Captain', captainSchema);
