import mongoose, { InferSchemaType, Schema } from "mongoose";
import { MessageInput } from "../libs/types/message";
import {
  MessageSenderType,
  MessageReceiverType,
} from "../libs/enums/message.enum";

const MessageSchema = new Schema<MessageInput>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    senderType: {
      type: String,
      enum: MessageSenderType,
      required: true,
    },
    deletedBySender: {
      type: Boolean,
      default: false,
    },

    receiverId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    receiverType: {
      type: String,
      enum: MessageReceiverType,
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
    isRead: {
      type: Boolean,
      default: false,
    },
    whenIsRead: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);
MessageSchema.index({
  receiverId: 1,
  createdAt: -1,
});
MessageSchema.index({
  senderId: 1,
  createdAt: -1,
});

export type MessageDoc = InferSchemaType<typeof MessageSchema>;
export default mongoose.model<MessageDoc>("Message", MessageSchema);
