import { ObjectId } from "mongoose";
import { ViewGroup } from "../enums/view.enum";

export interface ViewInput {
  userId: ObjectId;
  viewTargetId: ObjectId;
  viewGroup: ViewGroup;
}
export interface View {
  _id: ObjectId;
  viewTargetId: ObjectId;
  viewGroup: ViewGroup;
  userId: ObjectId;
  createdAt: ObjectId;
  updatedAt: ObjectId;
}
