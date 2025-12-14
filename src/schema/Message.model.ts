import mongoose, { InferSchemaType, Schema } from "mongoose";
import { MessageInput } from "../libs/types/message";
import {
  MessageSenderType,
  MessageReceiverType,
  CollectionName,
} from "../libs/enums/message.enum";

const MessageSchema = new Schema<MessageInput>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    senderCollectionName: {
      type: String,
      enum: CollectionName,
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
    receiverCollectionName: {
      type: String,
      enum: CollectionName,
      required: true,
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
  }
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
