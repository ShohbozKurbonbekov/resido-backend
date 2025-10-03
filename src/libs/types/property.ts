import { ObjectId } from "mongoose";
import {
  PropertyCooling,
  PropertyFurnature,
  PropertyHeating,
  PropertySecurity,
  PropertyStatus,
  PropertyType,
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
    type?: string;
    overalAmount?: number;
    monthlyPayment?: number;
    devidedMonths?: number;
  };
  optionSell?: {
    type?: string;
    overalAmunt?: number;
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
  nearBySchools?: boolean;
  nearByTransports?: boolean;
  viewedBy?: ObjectId[];
  status?: PropertyStatus;
  likedBy?: ObjectId[];
  firePlace?: boolean;
  comments?: ObjectId[];
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
  comments: ObjectId[];
  yearBuilt: number;
  garageSpace: number;
  amenities: PropertyAmenities;
  viewedBy: ObjectId[];
  likedBy: ObjectId[];
  nearBySchools?: boolean;
  nearByTransports?: boolean;
  firePlace?: boolean;
  videos?: string[];
}
export type PropertyDocument = Property & Document;

export interface RecentForRentInput {
  page: number;
  limit: number;
}

export interface RecentForRentOutput {
  properties: Property[];
  totalPropertiesNumber: number;
}
