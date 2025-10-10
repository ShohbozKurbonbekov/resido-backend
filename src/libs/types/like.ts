import { ObjectId } from "mongoose";
import { LikeGroup } from "../enums/like.enum";

export interface LikeInput {
  userId: ObjectId;
  targetId: ObjectId;
  likeGroup: LikeGroup;
}

export interface Like {
  _id: ObjectId;
  userId: ObjectId;
  targetId: ObjectId;
  likeGroup: LikeGroup;
  createdAt: Date;
  updatedAt: Date;
}
