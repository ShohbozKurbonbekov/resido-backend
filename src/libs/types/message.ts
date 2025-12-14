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
  _id: string;
  name: string;
  avatar?: string;
  descsription?: string;
}

export interface MessageInput {
  senderId?: ObjectId;
  senderType: MessageSenderType;
  deletedBySender?: boolean;
  senderCollectionName: CollectionName;
  senderData?: SenderReceiverType;

  receiverId?: ObjectId;
  receiverType: MessageReceiverType;
  deletedByReceiver?: boolean;
  receiverCollectionName: CollectionName;
  receiverData?: SenderReceiverType;

  isRead?: boolean;
  whenIsRead?: Date;
  content: string;
  subject: string;
  email: string;
  phone: string;
}

export interface MessagesOutput {
  messages: MessageInput[];
  metaCounter: TotalCounter[];
}
