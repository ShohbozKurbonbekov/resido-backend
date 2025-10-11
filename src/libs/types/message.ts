import { ObjectId } from "mongoose";
import { MessageReceiverType, MessageSenderType } from "../enums/message.enum";

export interface MessageInput {
  //sender
  senderId?: ObjectId;
  senderType: MessageSenderType;
  deletedBySender?: boolean;

  // receiver
  receiverId?: ObjectId;
  receiverType: MessageReceiverType;
  deletedByReceiver?: boolean;

  // content
  isRead?: boolean;
  whenIsRead?: Date;
  content: string;
  subject: string;
  email: string;
  phone: string;
}
