import { ObjectId } from "mongoose";
import {
  MajorCites,
  PropertyCooling,
  PropertyFurnature,
  PropertyHeating,
  PropertyMood,
  PropertySecurity,
  PropertySortOrder,
  PropertyStatus,
  PropertyType,
  SellingTypeEnum,
} from "../enums/property.enum";
import { Document } from "mongoose";

export interface PropertyAddress {
  street?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  country?: string;
  geoCode?: GeocodeType;
}

interface GeocodeType {
  lat: number;
  long: number;
}

interface SellingType {
  optionRent?: {
    type?: SellingTypeEnum;
    overalAmunt?: number;
    monthlyPayment?: number;
    devidedMonths?: number;
  };
  optionSell?: {
    type?: string;
    overalAmount?: number;
    discount?: string;
  };
}

export interface PropertyAmenities {
  airConditioning?: boolean;
  swimmingPool?: boolean;
  centralHeating?: boolean;
  laundryRoom?: boolean;
  gym?: boolean;
  alarm?: boolean;
  windowCovering?: boolean;
  internet?: boolean;
  petsAllow?: boolean;
  freeWifi?: boolean;
  carParking?: boolean;
  spaMassage?: boolean;
}

export interface PropertyInput {
  agencyId: ObjectId;
  agentId: ObjectId;
  title: string;
  sellingOption: SellingType;
  floors: number;
  propertyType: PropertyType;
  area: number;
  bathrooms: number;
  bedrooms: number;
  description: string;
  heating: PropertyHeating;
  cooling: PropertyCooling;
  address?: PropertyAddress;
  furnished?: PropertyFurnature;
  images?: string[];
  security?: PropertySecurity;
  yearBuilt: number;
  mood?: PropertyMood;
  garageSpace: number;
  amenities?: PropertyAmenities;
  nearBySchools?: boolean;
  nearByTransports?: boolean;
  views?: number;
  averageRating?: number;
  status?: PropertyStatus;
  totalLikes?: number;
  recentBoost?: number;
  daysSinceCreated?: number;
  firePlace?: boolean;
  videos?: string[];
}

export interface Property {
  _id: ObjectId;
  agencyId: ObjectId;
  agentId: ObjectId;
  title: string;
  status: PropertyStatus;
  sellingOption: SellingType;
  floors: number;
  propertyType: PropertyType;
  area: number;
  images: string[];
  bathrooms: number;
  bedrooms: number;
  address: PropertyAddress;
  description: string;
  heating: PropertyHeating;
  cooling: PropertyCooling;
  furnished: PropertyFurnature;
  security: PropertySecurity;
  yearBuilt: number;
  garageSpace: number;
  amenities: PropertyAmenities;
  views: number;
  averageRating: number;
  totalLikes: number;
  featuredScore: number;
  totalComments: number;
  nearBySchools: boolean;
  nearByTransports: boolean;
  firePlace: boolean;
  videos: string[];
  recentBoost: number;
  daysSinceCreated: number;
  mood?: PropertyMood;
}

export type PropertyDocument = Property & Document;

export interface RecentPropertyForRent {
  page: number;
  limit: number;
}

export interface RecentPropertyResult {
  properties: Property[];
  totalPropertiesNumber: number;
}

export interface PropertySearchFeatures {
  propertySearch?: string;
  propertyVerified?: boolean;
  propertyAgentLevel?: boolean;
  propertyLocation?: MajorCites;
  propertyType?: PropertyType;
  propertyBedrooms?: number;
  propertyAmenities?: PropertyAmenities;
  propertyMood?: PropertyMood;
  propertyPriceRange?: number;
}

export interface PropertyInquery {
  page: number;
  limit: number;
  order: PropertySortOrder;
  search?: PropertySearchFeatures;
}

export interface TotalCounter {
  total?: number;
}

export interface Properties {
  properties?: Property[];
  metaCounter?: TotalCounter[];
}
