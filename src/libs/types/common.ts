import { ObjectId } from "mongoose";
import { Agent, AgentInputUpdate } from "./agent";
import { User, UserInputUpdate } from "./user";
import { Agency } from "../../schema/members/Agency.model";
import { AgencyInputUpdate } from "./agency";
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
