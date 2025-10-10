import { Schema, ObjectId } from "mongoose";
import { LikeInput } from "../libs/types/like";
import { LikeGroup } from "../libs/enums/like.enum";

const LikeSchema = new Schema<LikeInput>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    targetId: {
      type: Schema.Types.ObjectId,
    },
    likeGroup: {
      type: String,
      enum: LikeGroup,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

LikeSchema.index(
  {
    userId: 1,
    targetId: 1,
  },
  { unique: true }
);
