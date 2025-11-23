import { ObjectId } from "mongoose";
import {
  AgencyCurrentBadge,
  AgencyTargetType,
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
export interface AgencyMemberInput {
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  memberPassword: string;
  role: MemberType;
  agencyOwner: string;
  country: string;
  city: string;
  address: string;
  bioInfo: string;
  billingInfo: BillingDetails;
  socialLinks: Social;
  views?: number;
  agencyBadge?: AgencyCurrentBadge;
  isVerified?: boolean;
  avatar?: string;
  agencyItems?: AgencyToggleStateType;
  registrationNumber?: string;
  agentsTotalNumber?: number;
  propertiesTotalNumber?: number;
  featuredScore?: number;
  memberSince?: Date;
  permittedProperties?: number;
  _id?: ObjectId;
  memberStatus?: MemberStatus;
  createdAt?: Date;
  updatedAt?: Date;
  yearOfExperience: number;
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
