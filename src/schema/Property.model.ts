import mongoose, { Schema } from "mongoose";
import { Property, PropertyDocument } from "../libs/types/property";
import {
  PropertyCooling,
  PropertyFurnature,
  PropertyHeating,
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
        enum: SellingTypeEnum,
      },
      monthlyPayment: { type: Number },
      overalAmount: { type: Number },
      devidedMonths: { type: Number },
    },
    optionSell: {
      type: {
        type: String,
        enum: SellingTypeEnum,
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

const PropertySchema = new Schema(
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
    },
    featuredScore: {
      type: Number,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    totalLikes: {
      type: Number,
      default: 0,
    },
    firePlace: { type: Boolean, default: false },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    videos: {
      type: [String],
      default: [],
    },
  },

  { timestamps: true }
);

PropertySchema.pre("save", async function (next) {
  this.totalComments = this.comments.length ? this.comments.length : 0;

  const ratings = this.comments.map((c: any) => c.rating || 0) || [];
  this.averageRating = ratings.length
    ? ratings.reduce((acc, val) => acc + val, 0) / ratings.length
    : 0;

  if (!this.createdAt) this.createdAt = new Date();
  const daysSinceCreated = Math.floor(
    (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  const recencyBoost = daysSinceCreated <= 7 ? 1 : 0;

  const views = this.views || 0;
  const avgRating = this.averageRating || 0;
  const totalComments = this.totalComments || 0;
  const totalLikes = this.totalLikes || 0;

  this.featuredScore =
    avgRating * 0.4 +
    Math.log(totalComments + 1) * 0.25 +
    Math.log(views + 1) * 0.2 +
    Math.log(totalLikes + 1) * 0.1 +
    recencyBoost * 0.05;
  next();
});
PropertySchema.index({
  featuredScore: -1,
  status: 1,
});
export default mongoose.model<PropertyDocument>("Property", PropertySchema);
