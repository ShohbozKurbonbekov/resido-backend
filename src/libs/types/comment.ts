import { ObjectId } from "mongoose";
import { CommentStatus, CommentTargetType } from "../enums/comment.enum";

interface UserInfoType {
  avatar: string;
  name: string;
  phone?: string;
  email?: string;
  userAddress?: string;
  userDescription?: string;
}

export interface CommentInput {
  targetType: CommentTargetType;
  targetId: ObjectId;
  content: string;
  userInfo?: UserInfoType;
  userId?: ObjectId;
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
