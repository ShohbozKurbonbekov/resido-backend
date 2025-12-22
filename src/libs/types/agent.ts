import { ObjectId } from "mongoose";
import { MemberStatus, MemberType } from "../enums/member.enum";
import { CommonPageInput, Social } from "./common";
import { AgentPropertyType, AgentStatus } from "../enums/agent.enum";
import { RecentPropertyForRent, TotalCounter } from "./property";
import { Agency } from "../../schema/members/Agency.model";
import { Property } from "../../schema/Property.model";

export interface MemberAgentInput {
  userId: string;
  agencyId: string;
  nickname: string;
  fullName: string;
  phone: string;
  role?: MemberType;
  address: string;
  memberStatus?: MemberStatus;
  yearOfExperience: number;
  bioInfo: string;
  socialLinks: Social;
  licenseNumber: string;
  currentStatus?: AgentStatus;
  certificate: string;
  totalComments?: number;
  views?: number;
  totalLikes?: number;
  averageRating?: number;
  featuredScore?: number;
  rank?: string;
  avatar?: string;
  points?: number;
  isVerified?: boolean;
}

export interface Agent {
  _id: ObjectId;
  agencyId: ObjectId;
  userId: ObjectId;
  nickname: string;
  fullName: string;
  phone: string;
  role: MemberType;
  address: string;
  yearOfExperience: number;
  bioInfo: string;
  memberStatus: MemberStatus; // setIn the schema
  licenseNumber: string; // set in the schema
  points: number; // set in the schema
  socialLinks: Social; // set in the schema
  isVerified: boolean; // set in the schema
  totalComments: number;
  views: number;
  totalLikes: number;
  totalSavings: number;
  averageRating: number;
  featuredScore?: number;
  rank?: string;
  ///////////
  currentStatus: AgentStatus;
  certificate: string;
  agentMode: boolean;
  avatar?: string;
  // comments?: [];
}

export interface AgentInputUpdate {
  _id: ObjectId;
  nickname?: string;
  fullName?: string;
  phone?: string;
  address?: string;
  yearOfExperience?: number;
  bioInfo?: string;
  socialLinks?: Social;
  avatar?: string;
}

export interface FollowedAgent {
  _id: string;
  agencyId: string;
  nickname: string;
  fullName: string;
  averageRating: number;
  createdAt: number;
  totalSavings: number;
  propertiesNumber: number;
  avatar?: string;
}

export interface AgentResults {
  agents: FollowedAgent[];
  totalNumbers: TotalCounter[];
}

export type FeaturedAgentsInput = RecentPropertyForRent;
export type FeaturedAgentsResult = AgentResults;

export interface SearchByLocationInput extends CommonPageInput {
  location?: string;
}
export type SearchByLocationResult = AgentResults;

export interface AgentDetailType {
  agent: Agent[];
}

export interface AgentPropertiesInput extends CommonPageInput {
  agentPropertyType?: AgentPropertyType;
  searchLocation?: string;
}
