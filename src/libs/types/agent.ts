import { ObjectId } from "mongoose";
import { MemberStatus, MemberType } from "../enums/member.enum";
import { Social } from "./common";
import { AgentStatus } from "../enums/agent.enum";
import { RecentPropertyForRent, TotalCounter } from "./property";
import { Agency } from "../../schema/members/Agency.model";

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
  rank?: string;
  ///////////
  avatar?: string;
  points?: number;
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
  rank: string;
  ///////////
  currentStatus: AgentStatus;
  avatar?: string;
  // comments?: [];
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

export interface AgentResults {
  agents: Agent[];
  totalNumbers: TotalCounter[];
}

export type FeaturedAgentsInput = RecentPropertyForRent;
export type FeaturedAgentsResult = AgentResults;

export interface SearchByLocationInput {
  page: number;
  limit: number;
  location: string;
}
export type SearchByLocationResult = AgentResults;
