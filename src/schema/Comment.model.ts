import mongoose, { InferSchemaType, Schema } from "mongoose";
import { CommentStatus, CommentTargetType } from "../libs/enums/comment.enum";
import { CommentInput } from "../libs/types/comment";

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
    userInfo: {
      type: {
        name: {
          type: String,
          required: true,
        },
        avatar: {
          type: String,
          required: true,
        },
        phone: {
          type: String,
        },
        email: {
          type: String,
        },
        userAddress: { type: String },
        userDescription: {
          type: String,
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

export type CommentDocs = InferSchemaType<typeof CommentSchema>;

export default mongoose.model<CommentDocs>("Comment", CommentSchema);
