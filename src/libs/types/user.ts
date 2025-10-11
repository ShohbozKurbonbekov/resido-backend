import { ObjectId } from "mongoose";
import { MemberStatus, MemberType } from "../enums/member.enum";
import { Request } from "express";
import { Agent } from "./agent";
import { Social } from "./common";

export interface ExtendedRequest extends Request {
  file: Express.Multer.File;
  files: Express.Multer.File[];
  member: Agent;
}

export interface UserMemberInput {
  memberName: string;
  memberPhone: string;
  memberEmail: string;
  memberPassword: string;
  role: MemberType;
  memberStatus?: MemberStatus;
  memberAddress?: string;
  memberDescription?: string;
  memberSocials?: Social;
  userFullname?: string;
  avatar?: string;
  occuption?: string;
}

export interface User {
  _id: ObjectId;
  memberName: string;
  memberPhone: string;
  memberEmail: string;
  memberPassword: string;
  role: MemberType;
  memberStatus: MemberStatus;
  memberSocials: Social;
  occupation?: string;
  userFullname?: string;
  memberAddress?: string;
  memberDescription?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserInputUpdate {
  _id: ObjectId;
  memberName?: string;
  memberPhone?: string;
  memberEmail?: string;
  memberPassword?: string;
  userFullname?: string;
  userAddress?: string;
  occuption?: string;
  userDescription?: string;
  avatar?: string;
}

export interface BillingDetails {
  planName: string;
  subscriptionDate: Date;
  subscriptionStatus: String;
}

export interface LoginInput {
  memberEmail: string;
  memberPassword: string;
}
