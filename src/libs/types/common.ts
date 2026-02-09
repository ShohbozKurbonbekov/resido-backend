import { ObjectId } from "mongoose";
import { Agent, AgentInputUpdate } from "./agent";
import { User, UserInputUpdate } from "./user";
import { Agency } from "../../schema/members/Agency.model";
import { AgencyInputUpdate } from "./agency";
import { PropertyStatus } from "../enums/property.enum";
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
