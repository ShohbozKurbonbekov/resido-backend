import { ObjectId } from "mongoose";
import {
  AgencyCurrentBadge,
  AgencyStatus,
  AgencyTargetType,
  PaymentProvider,
  SubscriptionStatus,
  SubscriptionTarrif,
} from "../enums/agency.enum";
import { MemberStatus, MemberType } from "../enums/member.enum";
import { CommonPageInput, Social } from "./common";
import { Agent } from "./agent";
import { TotalCounter } from "./property";
import { Agency } from "../../schema/members/Agency.model";
import { Property } from "../../schema/Property.model";

export interface BillingDetails {
  planName: SubscriptionTarrif;
  subscriptionDate: Date;
  subscriptionStatus: SubscriptionStatus;
}
export interface AgencyToggleStateType {
  agents?: Agent[];
  properties?: Property[];
}

export interface AgencyInputs {
  userId: ObjectId;
  role: MemberType;
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  yearOfExperience: number;
  address: string;
  agencyOwner: string;
  registrationNumber: string;
  certificate: string;
  licenseNumber: string;
}

export interface AgencyAggregate extends AgencyInputs {
  // SERVER DEFAULT INPUTS
  views?: number;
  createdAt?: Date;
  updatedAt?: Date;
  memberStatus?: MemberStatus;
  currentStatus?: AgencyStatus;
  memberSince?: Date;
  featuredScore?: number;
  _id?: ObjectId;
  isVerified?: boolean;

  // STEP  =>  2 AFTER ADMIN CHECK
  permittedProperties?: number;
  permittedAgents?: number;

  // STEPT =>  3 =>  AGENCY OPTIONAL INPUTS
  socialLinks?: Social;
  avatar?: string;
  bioInfo?: string;

  // SET-BY-SERVER INPUTS FOR FRONT-END
  agencyBadge?: AgencyCurrentBadge;
  agencyItems?: AgencyToggleStateType;
  agentsTotalNumber?: number;
  propertiesTotalNumber?: number;
}

export interface AgencyInputUpdate {
  _id: ObjectId;
  memberName?: string;
  memberEmail?: string;
  memberPhone?: string;
  memberPassword?: string;
  bioInfo?: string;
  address?: string;
  agencyOwner?: string;
  country?: string;
  socialLinks?: Social;
  city?: string;
  avatar?: string;
}

export interface AgencyResults {
  agencies: Agency[];
  totalNumbers: TotalCounter[];
}
export type SearchByLocationAgency = AgencyResults;

export interface AgencyAgePropertiesInput extends CommonPageInput {
  agencyTarget?: AgencyTargetType;
  location?: string;
}

export interface AgencyAgePropertiesResult {
  agency: Agency;
}

/////////////////  SUBSCRIPTIONS /////////////
export interface AgencySubscriptionInputs {
  agencyId: ObjectId;
  planName: SubscriptionTarrif;
  billingName: string;
  billingEmail: string;
  billingAddress: string;
  billingCountry: string;
  subscriptionStatus: SubscriptionStatus;
  paymentProvider: PaymentProvider;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: Date;
}
