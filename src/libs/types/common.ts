import { ObjectId } from "mongoose";
import { Agent, AgentInputUpdate } from "./agent";
import { User, UserInputUpdate } from "./user";
import { Agency } from "../../schema/members/Agency.model";
import { AgencyInputUpdate } from "./agency";
import { PropertyStatus } from "../enums/property.enum";
import { TotalCounter } from "./property";
import { MemberStatus, MemberType } from "../enums/member.enum";
import { AgentStatus } from "../enums/agent.enum";
export interface T {
  [key: string]: any;
}

export interface Social {
  facebook: string | null;
  twitter: string | null;
  instagram: string | null;
  linkedin: string | null;
  email: string | null;
}

export interface StatisticsModifier {
  _id: ObjectId;
  targetKey: string;
  modifier: number;
}
export type CommonUsers = Agency | Agent | User;
export type CommonUsersUpdateInput =
  | AgencyInputUpdate
  | UserInputUpdate
  | AgentInputUpdate;

export interface CommonPageInput {
  limit: number;
  page: number;
}

export interface AllPropertiesInput extends CommonPageInput {
  status: PropertyStatus;
}

export type ToString<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: string;
};

export interface StatusChangeType<TStatus> {
  id: ObjectId;
  status: TStatus;
}

export interface AdminGetCommonMember {
  id: ObjectId;
  name: string;
  type: MemberType;
  systemStatus: MemberStatus;
  phone: string;
  date: Date;
}

export interface AdminGetAgentType extends AdminGetCommonMember {
  verified: boolean;
  averageRating: number;
  businessStatus: AgentStatus;
  licenseNumber: string;
}

export type AdminGetAgencyType = AdminGetCommonMember &
  Pick<AdminGetAgentType, "licenseNumber" | "businessStatus" | "verified"> & {
    registrationNumber: string;
  };

export type AdminGetUserType = AdminGetCommonMember;

export interface AdminMembers {
  metaCounter: TotalCounter[];
  members: AdminGetAgencyType | AdminGetAgentType | AdminGetUserType[][];
}
