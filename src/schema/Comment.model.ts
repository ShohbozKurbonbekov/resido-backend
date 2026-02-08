import mongoose, { InferSchemaType, Schema } from "mongoose";
import { CommentStatus, CommentTargetType } from "../libs/enums/comment.enum";
import { CommentInput, ReceiverDataType } from "../libs/types/comment";

const ReceiverDataSchema = new Schema<ReceiverDataType>(
  {
    targetName: {
      type: String,
      required: true,
    },
    targetImage: {
      type: String,
    },
  },
  {
    _id: false,
  },
);

const CommentSchema = new Schema<CommentInput>(
  {
    userId: {
      type: Schema.Types.ObjectId,
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
    receiverData: {
      type: ReceiverDataSchema,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

CommentSchema.index({
  userId: 1,
  status: 1,
  createdAt: 1,
});

export type CommentDocs = InferSchemaType<typeof CommentSchema>;

export default mongoose.model<CommentDocs>("Comment", CommentSchema);
