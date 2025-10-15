import { ObjectId } from "mongoose";
import {
  AgencyCurrentBadge,
  SubscriptionStatus,
  SubscriptionTarrif,
} from "../enums/agency.enum";
import { MemberStatus, MemberType } from "../enums/member.enum";
import { Social } from "./common";
import { Agent } from "./agent";
import { TotalCounter } from "./property";

export interface BillingDetails {
  planName: SubscriptionTarrif;
  subscriptionDate: Date;
  subscriptionStatus: SubscriptionStatus;
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
  registrationNumber?: string;
  memberSince?: Date;
  permittedProperties?: number;
  _id?: ObjectId;
  memberStatus?: MemberStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

// export interface Agency {
//   _id: ObjectId;
//   memberName: string;
//   memberEmail: string;
//   memberPhone: string;
//   memberPassword: string;
//   role: MemberType;
//   memberStatus: MemberStatus;
//   address?: string;
//   bioInfo?: string;
//   agencyOwner?: string;
//   avatar?: string;
//   country?: string;
//   city?: string;
//   registrationNumber: string;
//   memberSince: Date;
//   permittedProperties: number;
//   billingInfo: BillingDetails;
//   agenycBadge: AgencyCurrentBadge;
//   socialLinks: Social;
//   isVerified: boolean;
//   views: number;
// }

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

export interface AgencyLocation {
  limit: number;
  page: number;
  location: string;
}

export interface AgencyResults {
  agencies: Agent[];
  totalAgenciesNumber: TotalCounter[];
}
