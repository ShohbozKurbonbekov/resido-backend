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
  role: MemberType;
  memberStatus?: MemberStatus;
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
