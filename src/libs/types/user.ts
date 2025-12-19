import { ObjectId } from "mongoose";
import { MemberStatus, MemberType } from "../enums/member.enum";
import { Request } from "express";
import { CommonUsers, Social } from "./common";
import { TotalCounter } from "./property";

export interface UploadFiles {
  videos?: Express.Multer.File[];
  images?: Express.Multer.File[];
  blogImage?: Express.Multer.File[];
  avatar?: Express.Multer.File[];
}

export type UploadRequest = Request<{ id: string }, {}, any> & {
  files?: UploadFiles;
  member: CommonUsers;
};
export interface ExtendedRequest extends Request {
  file: Express.Multer.File;
  files: Express.Multer.File[];
  member: CommonUsers;
}

export interface UserMemberInput {
  memberName: string;
  memberPhone: string;
  memberEmail: string;
  memberPassword: string;
  role: MemberType;
  memberStatus?: MemberStatus;
  memberAddress?: string;
  memberDescription?: string;
  memberSocials?: Social;
  userFullname?: string;
  avatar?: string;
  occuption?: string;
}

export interface User {
  _id: ObjectId;
  memberName: string;
  memberPhone: string;
  memberEmail: string;
  memberPassword: string;
  role: MemberType;
  memberStatus: MemberStatus;
  memberSocials: Social;
  occupation?: string;
  userFullname?: string;
  memberAddress?: string;
  memberDescription?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserInputUpdate {
  _id: ObjectId;
  memberName?: string;
  memberPhone?: string;
  memberEmail?: string;
  memberPassword?: string;
  userFullname?: string;
  userAddress?: string;
  occuption?: string;
  userDescription?: string;
  avatar?: string;
  memberSocials?: Social;
}

export interface LoginInput {
  memberEmail: string;
  memberPassword: string;
}

export interface UserDashboardOverviewType {
  savedProperties: TotalCounter;
  savedArticles: TotalCounter;
  followedAgents: TotalCounter;
  reviews: TotalCounter;
  messages: TotalCounter;
  generatedAt: Date;
}
