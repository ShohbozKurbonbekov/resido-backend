import { ObjectId } from "mongoose";
import { Agency } from "./agency";
import { Agent } from "./agent";
import { User } from "./user";

export interface T {
  [key: string]: any;
}

export interface Social {
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  emial: string;
}

export interface StatisticsModifier {
  _id: ObjectId;
  targetKey: string;
  modifier: number;
}
export type CommonUsers = Agency | Agent | User;
