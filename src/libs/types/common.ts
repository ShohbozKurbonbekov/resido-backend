import { ObjectId } from "mongoose";

export interface T {
  [key: string]: any;
}

export interface Social {
  facbook: string;
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
