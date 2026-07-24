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

const GeoCodeSchema = new Schema(
  {
    lat: { type: Number, required: true },
    long: { type: Number, required: true },
  },
  {
    _id: false,
  },
);

const PropertyAddressSchema = new Schema(
  {
    street: { type: String, required: true },
    district: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    geoCode: {
      type: GeoCodeSchema,
      required: false,
    },
  },
  { _id: false },
);

///////////////////// Price Db Validation ///////////
const RentSchema = new Schema(
  {
    type: {
      type: String,
      enum: [SellingTypeEnum.RENT],
      required: true,
    },
    monthlyPayment: { type: Number, required: true },
    overalAmount: { type: Number, required: true },
    devidedMonths: { type: Number, required: true },
  },
  { _id: false },
);

const SellSchema = new Schema(
  {
    type: {
      type: String,
      enum: [SellingTypeEnum.SALE],
      required: true,
    },
    overalAmunt: { type: Number, required: true },
    discount: { type: Number, required: true },
  },
  { _id: false },
);

const PropertySellingOptionSchema = new Schema(
  {
    optionRent: {
      type: RentSchema,
      required: false,
    },
    optionSell: {
      type: SellSchema,
      required: false,
    },
  },
  { _id: false },
);

///////////////////// Price Db Validation End ///////////

const PropertyAmenitiesSchema = new Schema(
  {
    airConditioning: { type: Boolean },
    swimmingPool: { type: Boolean },
    centralHeating: { type: Boolean },
    laundryRoom: { type: Boolean },
    gym: { type: Boolean },
    alarm: { type: Boolean },
    windowCovering: { type: Boolean },
    internet: { type: Boolean },
    petsAllow: { type: Boolean },
    freeWifi: { type: Boolean },
    carParking: { type: Boolean },
    spaMassage: { type: Boolean },
  },
  { _id: false },
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
      required: true,
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
      required: true,
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
      required: true,
    },
    security: {
      type: String,
      enum: PropertySecurity,
      required: true,
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
      required: true,
    },
    nearBySchools: {
      type: Boolean,
    },
    nearByTransports: {
      type: Boolean,
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
      required: true,
    },
    firePlace: { type: Boolean },
    videos: {
      type: [String],
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

  { timestamps: true },
);

PropertySchema.index({
  featuredScore: -1,
  famousIndicator: -1,
  status: 1,
  createdAt: -1,
  priceValue: 1,
  _id: 1,
});

PropertySchema.index({
  agentId: 1,
  agencyId: 1,
  "address.city": 1,
  "address.district": 1,
  "address.street": 1,
  "address.country": 1,
});
export type Property = InferSchemaType<typeof PropertySchema>;
export default mongoose.model<Property>("Property", PropertySchema);
