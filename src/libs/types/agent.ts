import { ObjectId } from "mongoose";
import { MemberStatus, MemberType } from "../enums/member.enum";
import Social, { T } from "./common";

export interface MemberAgentInput {
  agencyId: string;
  nickname: string;
  fullName: string;
  memberEmail: string;
  phone: string;
  memberPassword: string;
  role: MemberType;
  address: string;
  yearOfExperience: number;
  bioInfo: string;
  memberStatus?: MemberStatus;
  licenseNumber?: string;
  avatar?: string;
  points?: number;
  properties?: ObjectId[];
  comments?: ObjectId[];
  socialLinks?: Social;
  isVerified?: boolean;
}

export interface Agent {
  _id: ObjectId;
  agencyId: ObjectId;
  nickname: string;
  fullName: string;
  memberEmail: string;
  phone: string;
  memberPassword: string;
  role: MemberType;
  address: string;
  yearOfExperience: number;
  bioInfo: string;
  memberStatus: MemberStatus; // setIn the schema
  licenseNumber: string; // set in the schema
  points: number; // set in the schema
  socialLinks: Social; // set in the schema
  isVerified: boolean; // set in the schema
  properties?: ObjectId[];
  comments?: ObjectId[];
  avatar?: string;
}
