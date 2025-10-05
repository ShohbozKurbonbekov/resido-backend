import mongoose, { Schema } from "mongoose";
import { CommentStatus, CommentTargetType } from "../libs/enums/comment.enum";
import { CommentDocument, CommentInput } from "../libs/types/comment";

const CommentSchema = new Schema<CommentInput>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetType: {
      type: String,
      enum: CommentTargetType,
      required: true,
    },
    status: {
      type: String,
      enum: CommentStatus,
      default: CommentStatus.ACTIVE,
    },
    targetId: {
      type: Schema.Types.ObjectId,
    },
    content: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<CommentDocument>("Comment", CommentSchema);
