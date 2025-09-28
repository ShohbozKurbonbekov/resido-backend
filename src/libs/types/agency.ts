import { ObjectId } from "mongoose";
import { AgencyCurrentBadge } from "../enums/agency.enum";
import { MemberStatus, MemberType } from "../enums/member.enum";
import Social, { T } from "./common";
import { BillingDetails } from "./user";

export interface AgencyMemberInput {
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  memberPassword: string;
  role: MemberType;
  memberStatus?: MemberStatus;
  agencyOwner?: string;
  country?: string;
  city?: string;
  address?: string;
  avatar?: string;
  registrationNumber?: string;
  memberSince?: number;
  properties?: ObjectId[];
  agents?: ObjectId[];
  bioInfo?: string;
  billingInfo?: BillingDetails;
  viewedBy?: ObjectId[];
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
  memberStatus: MemberStatus;
  role: MemberType;
  agencyOwner?: string;
  country?: string;
  city?: string;
  address?: string;
  avatar?: string;
  registrationNumber?: string;
  memberSince?: number;
  properties?: ObjectId[];
  agents?: ObjectId[];
  bioInfo?: string;
  billingInfo?: BillingDetails;
  socialLinks?: Social;
  viewedBy?: ObjectId[];
  agencyBadge?: AgencyCurrentBadge;
  createdAt: Date;
  updatedAt: Date;
  verified: boolean;
  isDeleted: boolean;
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
