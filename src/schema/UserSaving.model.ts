import mongoose, { InferSchemaType, Schema } from "mongoose";
import { TargetGroup } from "../libs/enums/userSaving.enum";
import { SavingInput } from "../libs/types/userSaving";

const UserSaving = new Schema<SavingInput>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    targetGroup: {
      type: String,
      enum: TargetGroup,
    },
  },
  {
    timestamps: true,
  }
);

UserSaving.index(
  {
    userId: 1,
    targetId: 1,
    targetGroup: 1,
  },
  { unique: true }
);

export type SavingOutput = InferSchemaType<typeof UserSaving>;
export default mongoose.model<SavingOutput>("UserSaving", UserSaving);
