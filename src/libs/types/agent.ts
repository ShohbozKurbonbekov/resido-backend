import { ObjectId } from "mongoose";
import { MemberStatus, MemberType } from "../enums/member.enum";
import { Social } from "./common";
import { AgentStatus } from "../enums/agent.enum";

export interface MemberAgentInput {
  agencyId: string;
  nickname: string;
  fullName: string;
  memberEmail: string;
  phone: string;
  memberPassword: string;
  role?: MemberType;
  address: string;
  memberStatus?: MemberStatus;
  yearOfExperience: number;
  bioInfo: string;
  licenseNumber: string;
  currentStatus?: AgentStatus;
  // featuresScore
  totalComments?: number;
  views?: number;
  totalLikes?: number;
  averageRating?: number;
  featuredScore?: number;
  ///////////
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
  // featuresScore
  totalComments: number;
  views: number;
  totalLikes: number;
  averageRating: number;
  featuredScore: number;
  ///////////
  currentStatus: AgentStatus;
  properties?: ObjectId[];
  comments?: ObjectId[];
  avatar?: string;
}

export interface AgentInputUpdate {
  _id: ObjectId;
  nickname?: string;
  fullName?: string;
  memberEmail?: string;
  phone?: string;
  memberPassword?: string;
  address?: string;
  yearOfExperience?: number;
  bioInfo?: string;
  socialLinks?: Social;
  avatar?: string;
}

export interface FeaturedAgentsInput {
  page: number;
  limit: number;
}

export interface FeaturedAgentsResult {
  properties: Agent[];
  totalPropertiesNumber: number;
}
