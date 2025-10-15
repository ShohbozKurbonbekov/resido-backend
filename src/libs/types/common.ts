import { ObjectId } from "mongoose";
import { Agent } from "./agent";
import { User } from "./user";
import { Agency } from "../../schema/members/Agency.model";
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
