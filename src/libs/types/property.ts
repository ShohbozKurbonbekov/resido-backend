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
import { Property } from "../../schema/Property.model";
import { CommonPageInput } from "./common";

// PROPERTY TYPE FOR CREATING AND RETRIEVING
export interface PropertyAddress {
  street?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  country?: string;
  geoCode?: GeocodeType;
}

export interface GeocodeType {
  lat?: number;
  long?: number;
}

interface SellingType {
  optionRent?: {
    type?: SellingTypeEnum.RENT;
    overalAmunt?: number;
    monthlyPayment?: number;
    devidedMonths?: number;
  };
  optionSell?: {
    type?: SellingTypeEnum.SALE;
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
  _id?: ObjectId;
  agencyId: ObjectId;
  agentId: ObjectId;
  title: string;
  sellingOption: SellingType;
  floors: number;
  propertyType: PropertyType;
  area: number;
  bathrooms: number;
  bedrooms: number;
  hall: number;
  kitchen: number;
  description: string;
  heating: PropertyHeating;
  cooling: PropertyCooling;
  address: PropertyAddress;
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
  totalComments?: number;
  totalSavings: number;
  featuredScore?: number;
  recentBoost?: number;
  daysSinceCreated?: number;
  firePlace?: boolean;
  videos?: string[];
  comments?: [];
}

// UPDATE PROPERTY TYPE
export interface PropertyUpdateInput {
  _id: ObjectId;
  title?: string;
  sellingOption?: SellingType;
  floors?: number;
  propertyType?: PropertyType;
  area?: number;
  images?: string[];
  bathrooms?: number;
  bedrooms?: number;
  hall?: number;
  kitchen?: number;
  address?: PropertyAddress;
  description?: string;
  heating?: PropertyHeating;
  cooling?: PropertyCooling;
  furnished?: PropertyFurnature;
  security?: PropertySecurity;
  yearBuilt?: number;
  garageSpace?: number;
  amenities?: PropertyAmenities;
  nearBySchools?: boolean;
  nearByTransports?: boolean;
  firePlace?: boolean;
  videos?: string[];
  mood?: PropertyMood;
}

export interface CommonPropertiesResult {
  properties: Property[];
  totalPropertiesNumber: TotalCounter[];
}

export type CommonPropertiesInput = CommonPageInput;

export type RecentPropertyForRent = CommonPageInput;

export type FeaturedPropertyInput = CommonPageInput;

export type RecentPropertyResult = CommonPropertiesResult;

export type FeaturedPropertyResult = CommonPropertiesResult;

export type Properties = CommonPropertiesResult;
export interface ChosenProperty {
  mainProperty: PropertyInput[];
  trendingProperties: PropertyInput[];
}

export interface PropertyPriceRange {
  start: number;
  end: number;
}
export interface PropertySearchFeatures {
  propertySearch?: string;
  propertyVerified?: boolean;
  propertyAgentLevel?: string;
  propertyLocation?: MajorCites;
  propertyType?: PropertyType;
  propertyBedrooms?: number;
  propertyAmenities?: PropertyAmenities;
  propertyMood?: PropertyMood;
  propertyPriceRange?: PropertyPriceRange;
}

export interface PropertyInquery extends CommonPageInput {
  order: PropertySortOrder;
  search?: PropertySearchFeatures;
}

export interface TotalCounter {
  total?: number;
}
