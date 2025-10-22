import { ObjectId } from "mongoose";
import { Agent, AgentInputUpdate } from "./agent";
import { User, UserInputUpdate } from "./user";
import { Agency } from "../../schema/members/Agency.model";
import { AgencyInputUpdate } from "./agency";
export interface T {
  [key: string]: any;
}

export interface Social {
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  email: string;
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
