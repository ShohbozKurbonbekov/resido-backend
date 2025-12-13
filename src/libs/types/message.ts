import { ObjectId } from "mongoose";
import {
  CollectionName,
  MessageReceiverType,
  MessageSenderType,
} from "../enums/message.enum";
import { CommonUsers } from "./common";
import { MessageDoc } from "../../schema/Message.model";
import { TotalCounter } from "./property";

export interface MessageInput {
  senderId?: ObjectId;
  senderType: MessageSenderType;
  deletedBySender?: boolean;
  senderCollectionName: CollectionName;
  senderData?: CommonUsers;

  receiverId?: ObjectId;
  receiverType: MessageReceiverType;
  deletedByReceiver?: boolean;
  receiverCollectionName: CollectionName;
  receiverData?: CommonUsers;

  isRead?: boolean;
  whenIsRead?: Date;
  content: string;
  subject: string;
  email: string;
  phone: string;
}

export interface MessagesOutput {
  messages: MessageDoc[];
  metaCounter: TotalCounter[];
}
