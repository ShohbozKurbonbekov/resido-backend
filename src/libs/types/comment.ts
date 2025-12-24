import { ObjectId } from "mongoose";
import { CommentStatus, CommentTargetType } from "../enums/comment.enum";
import { TotalCounter } from "./property";
import { CommonPageInput } from "./common";
import { CommentDocs } from "../../schema/Comment.model";

export interface ReceiverDataType {
  targetName: string;
  targetImage: string | undefined;
}
export interface CommentInput {
  targetType: CommentTargetType;
  targetId: ObjectId;
  content: string;
  receiverData: ReceiverDataType;
  userId?: ObjectId;
  rating?: number;
  status?: CommentStatus;
}

export interface CommentUpdate {
  rating: number;
  content: string;
}

export interface Comments {
  comments?: CommentDocs[];
  metaCounter?: TotalCounter[];
}
export interface ItemComments extends CommonPageInput {
  commentTarget: CommentTargetType;
}
