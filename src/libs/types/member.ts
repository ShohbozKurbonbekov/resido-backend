import { ObjectId } from "mongoose";
import { MemberStatus, MemberType } from "../enums/member.enum";
import { Document } from "mongoose";
import Social from "./common";
import { AgencyCurrentBadge } from "../enums/agency.enum";

export interface UserMemberInput {
  memberName: string;
  memberPhone: string;
  memberEmail: string;
  memberPassword: string;
  memberStatus?: MemberStatus;
  role: MemberType;
  userFullname?: string;
  userAddress?: string;
  userDescription?: string;
  userImage?: string;
}

export interface User {
  id: ObjectId;
  memberName: string;
  memberPhone: string;
  memberEmail: string;
  memberPassword: string;
  role: MemberType;
  memberStatus: MemberStatus;
  userFullname?: string;
  userAddress?: string;
  userDescription?: string;
  userImage?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BillingDetails {
  planName: string;
  subscriptionDate: Date;
  subscriptionStatus: String;
}

export interface AgencyMemberInput {
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  memberPassword: string;
  memberStatus?: string;
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
  viewCount?: number;
  socialLinks?: Social[];
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
