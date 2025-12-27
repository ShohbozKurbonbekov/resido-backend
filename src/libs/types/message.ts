import { ObjectId } from "mongoose";
import {} from "../enums/message.enum";
import { TotalCounter } from "./property";
import { MemberType } from "../enums/member.enum";

export interface SenderReceiverType {
  _id: ObjectId;
  name: string;
  avatar?: string;
}

export interface MessageInput {
  senderId?: ObjectId;
  senderType: MemberType;
  deletedBySender?: boolean;
  senderData?: SenderReceiverType;

  receiverId?: ObjectId;
  receiverType: MemberType;
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
