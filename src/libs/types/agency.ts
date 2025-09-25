import { ObjectId } from "mongoose";
import { AgencyCurrentBadge } from "../enums/agency.enum";
import { MemberType } from "../enums/member.enum";
import Social, { T } from "./common";
import { BillingDetails } from "./member";

export interface AgencyMemberInput {
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  memberPassword: string;
  role: MemberType;
  memberStatus?: string;
  agencyOwner?: string;
  country?: string;
  city?: string;
  address?: string;
  avatar?: string;
  registrationNumber?: string;
  memberSince?: number;
  properties?: T[];
  agents?: T[];
  bioInfo?: string;
  billingInfo?: BillingDetails;
  viewCount?: number;
  socialLinks?: Social;
  views?: number;
  agenycBadge?: AgencyCurrentBadge;
}

export interface Agency {
  _id: ObjectId;
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  memberPassword: string;
  memberStatus: string;
  role: MemberType;
  agencyOwner?: string;
  country?: string;
  city?: string;
  address?: string;
  avatar?: string;
  registrationNumber?: string;
  memberSince?: number;
  properties?: [];
  agents?: [];
  bioInfo?: string;
  billingInfo?: BillingDetails;
  socialLinks?: Social;
  views?: number;
  agencyBadge?: AgencyCurrentBadge;
  createdAt: Date;
  updatedAt: Date;
  verified: boolean;
  isDeleted: boolean;
}
