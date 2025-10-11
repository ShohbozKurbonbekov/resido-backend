import mongoose, { InferSchemaType, Schema } from "mongoose";
import { MessageInput } from "../libs/types/message";
import {
  MessageSenderType,
  MessageReceiverType,
} from "../libs/enums/message.enum";
const SenderInfoSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
  },
  {
    _id: false,
  }
);

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
    },
    receiverType: {
      type: String,
      enum: MessageReceiverType,
      required: true,
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
