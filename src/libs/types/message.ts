import { ObjectId } from "mongoose";
import {
  CollectionName,
  MessageReceiverType,
  MessageSenderType,
} from "../enums/message.enum";
import { CommonUsers } from "./common";
import { MessageDoc } from "../../schema/Message.model";
import { TotalCounter } from "./property";

export interface SenderReceiverType {
  _id: ObjectId;
  name: string;
  avatar?: string;
}

export interface MessageInput {
  senderId?: ObjectId;
  senderType: MessageSenderType;
  deletedBySender?: boolean;
  senderData?: SenderReceiverType;

  receiverId?: ObjectId;
  receiverType: MessageReceiverType;
  deletedByReceiver?: boolean;
  receiverData?: SenderReceiverType;

  isRead?: boolean;
  whenIsRead?: Date;
  content: string;
  isEdited?: boolean;
  subject: string;
  email: string;
  phone: string;
}

export interface MessagesOutput {
  messages: MessageInput[];
  metaCounter: TotalCounter[];
}
