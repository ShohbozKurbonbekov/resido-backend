import mongoose, { InferSchemaType, Schema } from "mongoose";
import { CommentStatus, CommentTargetType } from "../libs/enums/comment.enum";
import { CommentInput } from "../libs/types/comment";

const CommentUserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
    phone: {
      type: String,
    },
    occupation: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    userAddress: { type: String },
    userDescription: {
      type: String,
    },
  },
  {
    _id: false,
  }
);

const CommentSchema = new Schema<CommentInput>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
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
      trim: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    userInfo: {
      type: CommentUserSchema,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

CommentSchema.index({
  userId: 1,
  status: 1,
  createdAt: 1,
});

export type CommentDocs = InferSchemaType<typeof CommentSchema>;

export default mongoose.model<CommentDocs>("Comment", CommentSchema);
