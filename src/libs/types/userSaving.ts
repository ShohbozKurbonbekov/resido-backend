import { ObjectId } from "mongoose";
import { TargetGroup } from "../enums/userSaving.enum";

export interface SavingInput {
  userId: ObjectId;
  targetId: ObjectId;
  targetGroup: TargetGroup;
}
