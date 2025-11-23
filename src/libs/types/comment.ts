import { ObjectId } from "mongoose";
import { CommentStatus, CommentTargetType } from "../enums/comment.enum";
import { TotalCounter } from "./property";
import { CommonPageInput } from "./common";
import { CommentDocs } from "../../schema/Comment.model";

interface UserInfoType {
  avatar: string;
  name: string;
  occupation: string;
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

export interface Comments {
  comments?: CommentDocs[];
  metaCounter?: TotalCounter[];
}
export interface ItemComments extends CommonPageInput {
  commentTarget: CommentTargetType;
}
