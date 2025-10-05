import { ObjectId } from "mongoose";
import { CommentStatus, CommentTargetType } from "../enums/comment.enum";
import { Document } from "mongoose";

interface UserInfoType {
  avatar: string;
  name: string;
  phone?: string;
  email?: number;
  occupation?: string;
  userAddress?: string;
  userDescription?: string;
}

export interface CommentInput {
  userId: ObjectId;
  targetType: CommentTargetType;
  targetId: ObjectId;
  content: string;
  userInfo: UserInfoType;
  rating?: number;
  status?: CommentStatus;
}
export interface Comment {
  _id: ObjectId;
  userId: ObjectId;
  targetType: CommentTargetType;
  targetId: ObjectId;
  content: string;
  rating: number;
  status: CommentStatus;
  userInfo: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
export type CommentDocument = Comment & Document;
