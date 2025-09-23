import { ObjectId } from "mongoose";
import { MemberStatus, MemberType } from "../enums/member.enum";
import { Document } from "mongoose";

export interface UserDocument extends Document {
  id: ObjectId;
  userName: string;
  userPhone: string;
  userEmail: string;
  userPassword: string;
  role: MemberType;
  userStatus: MemberStatus;
  userFullname?: string;
  userAddress?: string;
  userDescription?: string;
  userImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserMemberInput {
  userName: string;
  userPhone: string;
  userEmail: string;
  userPassword: string;
  role: MemberType;
  userStatus?: MemberStatus;
  userFullname?: string;
  userAddress?: string;
  userDescription?: string;
  userImage?: string;
}

export interface User {
  id: ObjectId;
  userName: string;
  userPhone: string;
  userEmail: string;
  userPassword: string;
  role: MemberType;
  userStatus: MemberStatus;
  userFullname?: string;
  userAddress?: string;
  userDescription?: string;
  userImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Agent {}
export interface Agency {}
