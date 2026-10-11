import mongoose from 'mongoose';

const codeName = new mongoose.Schema({ code: { type: Number, required: true }, name: { type: String, required: true } }, { _id: false });

// Where a captain works: one entry per district, either the whole district or chosen mandals.
const serviceAreaSchema = new mongoose.Schema(
  {
    state: { type: codeName, required: true },
    district: { type: codeName, required: true },
    wholeDistrict: { type: Boolean, default: false },
    subdistricts: { type: [codeName], default: [] },
  },
  { _id: false }
);

const captainSchema = new mongoose.Schema(
  {
    _id: { type: String },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    phoneNormalized: { type: String, required: true, index: true },
    whatsapp: { type: String, required: true },
    avatar: { type: String, required: true },
    cityId: { type: String, required: true },
    serviceAreas: { type: [serviceAreaSchema], default: [] },
    // Optional home village/mandal (LGD), e.g. to show "lives in <village>".
    homePlace: {
      type: new mongoose.Schema(
        { state: codeName, district: codeName, subdistrict: codeName, village: codeName },
        { _id: false }
      ),
      default: undefined,
    },
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

captainSchema.index({ 'serviceAreas.district.code': 1 });

captainSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.phoneNormalized;
  },
});

export const Captain = mongoose.model('Captain', captainSchema);
