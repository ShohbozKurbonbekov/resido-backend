import mongoose, { InferSchemaType, Schema } from "mongoose";
import { PropertyInput } from "../libs/types/property";
import {
  PropertyCooling,
  PropertyFurnature,
  PropertyHeating,
  PropertyMood,
  PropertySecurity,
  PropertyStatus,
  PropertyType,
  SellingTypeEnum,
} from "../libs/enums/property.enum";

const PropertyAddressSchema = new Schema(
  {
    street: { type: String },
    district: { type: String },
    city: { type: String },
    postalCode: { type: String },
    country: { type: String },
    geoCode: {
      lat: { type: String },
      long: { type: String },
    },
  },
  { _id: false }
);
const PropertySellingOptionSchema = new Schema(
  {
    optionRent: {
      type: {
        type: String,
        enum: SellingTypeEnum.RENT,
      },
      monthlyPayment: { type: Number },
      overalAmount: { type: Number },
      devidedMonths: { type: Number },
    },
    optionSell: {
      type: {
        type: String,
        enum: SellingTypeEnum.SALE,
      },
      overalAmunt: { type: Number },
      discount: { type: Number },
    },
  },
  { _id: false }
);

PropertySellingOptionSchema.pre("save", function (next) {
  if (!this.optionRent && Object.keys(this.optionRent ?? {}).length === 0) {
    this.optionRent = undefined;
  }
  if (!this.optionSell && Object.keys(this.optionSell ?? {}).length === 0) {
    this.optionSell = undefined;
  }
  next();
});

const PropertyAmenitiesSchema = new Schema(
  {
    airConditioning: { type: Boolean, default: false },
    swimmingPool: { type: Boolean, default: false },
    centralHeating: { type: Boolean, default: false },
    laundryRoom: { type: Boolean, default: false },
    gym: { type: Boolean, default: false },
    alarm: { type: Boolean, default: false },
    windowCovering: { type: Boolean, default: false },
    internet: { type: Boolean, default: false },
    petsAllow: { type: Boolean, default: false },
    freeWifi: { type: Boolean, default: false },
    carParking: { type: Boolean, default: false },
    spaMassage: { type: Boolean, default: false },
  },
  { _id: false }
);

const PropertySchema = new Schema<PropertyInput>(
  {
    agencyId: {
      type: Schema.Types.ObjectId,
      ref: "Agency",
      required: true,
    },
    agentId: { type: Schema.Types.ObjectId, ref: "Agent", required: true },
    title: {
      type: String,
      trim: true,
      required: true,
    },
    status: {
      type: String,
      enum: PropertyStatus,
      default: PropertyStatus.DRAFT,
    },
    sellingOption: {
      required: true,
      type: PropertySellingOptionSchema,
    },
    floors: {
      type: Number,
      required: true,
    },
    propertyType: {
      type: String,
      enum: PropertyType,
      required: true,
    },
    area: { type: Number, required: true },
    images: {
      type: [String],
      default: [],
    },
    bathrooms: {
      type: Number,
      required: true,
    },
    bedrooms: {
      type: Number,
      required: true,
    },
    hall: {
      type: Number,
      required: true,
    },
    kitchen: {
      type: Number,
      required: true,
    },
    address: {
      type: PropertyAddressSchema,
      default: () => ({}),
    },
    description: {
      type: String,
      required: true,
    },
    heating: {
      type: String,
      enum: PropertyHeating,
      required: true,
    },
    cooling: {
      type: String,
      enum: PropertyCooling,
      required: true,
    },
    furnished: {
      type: String,
      enum: PropertyFurnature,
      default: PropertyFurnature.NONE,
    },
    security: {
      type: String,
      enum: PropertySecurity,
      default: PropertySecurity.None,
    },
    yearBuilt: {
      type: Number,
      required: true,
    },
    garageSpace: {
      type: Number,
      required: true,
    },
    amenities: {
      type: PropertyAmenitiesSchema,
      default: () => ({}),
    },
    nearBySchools: {
      type: Boolean,
      default: false,
    },
    nearByTransports: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    totalComments: {
      type: Number,
      default: 0,
    },
    totalSavings: {
      type: Number,
      default: 0,
    },
    featuredScore: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    totalLikes: {
      type: Number,
      default: 0,
    },
    mood: {
      type: String,
      enum: PropertyMood,
    },
    firePlace: { type: Boolean, default: false },
    videos: {
      type: [String],
      default: [],
    },
    recentBoost: {
      type: Number,
      default: 0,
    },
    daysSinceCreated: {
      type: Number,
      default: 0,
    },
  },

  { timestamps: true }
);

PropertySchema.index({
  featuredScore: -1,
  status: 1,
});

export type Property = InferSchemaType<typeof PropertySchema>;
export default mongoose.model<Property>("Property", PropertySchema);
