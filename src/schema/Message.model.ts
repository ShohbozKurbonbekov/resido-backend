import mongoose, { InferSchemaType, Schema } from "mongoose";
import { MessageInput, SenderReceiverType } from "../libs/types/message";

import { MemberType } from "../libs/enums/member.enum";

const SenderReceiverDataSchema = new Schema<SenderReceiverType>(
  {
    name: {
      type: String,
      required: true,
    },
    _id: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    avatar: {
      type: String,
    },
  },
  { _id: false },
);

const MessageSchema = new Schema<MessageInput>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    senderType: {
      type: String,
      enum: MemberType,
      required: true,
    },
    deletedBySender: {
      type: Boolean,
      default: false,
    },
    senderData: {
      type: SenderReceiverDataSchema,
      default: () => ({}),
    },

    receiverId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    receiverType: {
      type: String,
      enum: MemberType,
      required: true,
    },
    receiverData: {
      type: SenderReceiverDataSchema,
      default: () => ({}),
    },
    deletedByReceiver: {
      type: Boolean,
      default: false,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    whenIsRead: {
      type: Date,
      default: null,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },

  {
    timestamps: true,
  },
);
MessageSchema.index({
  senderId: 1,
  receiverId: 1,
  createdAt: 1,
  deletedByReceiver: 1,
  deletedBySender: 1,
});

export type MessageDoc = InferSchemaType<typeof MessageSchema>;
export default mongoose.model<MessageDoc>("Message", MessageSchema);
