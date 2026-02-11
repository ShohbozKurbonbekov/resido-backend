import { ObjectId } from "mongoose";
import { MemberType } from "../enums/member.enum";
import {
  NotificationEntityType,
  NotificationType,
} from "../enums/notification.enum";
import { NotificationOutput } from "../../schema/Notification.model";
import { TotalCounter } from "./property";
import { AgentDoc } from "../../schema/members/Agent.model";

export interface ApprovePayload {
  rejectorName: string;
}

export interface RejectedPayload {
  reason: string;
}

export type NotificationPayload = ApprovePayload | RejectedPayload | null;

export interface NotificationCreation {
  recipientId: ObjectId;
  recipientRole: MemberType;
  type: NotificationType;
  entityType: NotificationEntityType;
  entityId: ObjectId;
  actionRequired: boolean;
  payload: NotificationPayload;
  resolvedAt?: ObjectId;
}

export type NotificationInput = Omit<
  NotificationCreation,
  "payload" | "resolvedAt"
>;

export interface MyNotifications {
  notifications: NotificationOutput[];
  metaCounter: TotalCounter[];
}

export interface ReviewNotificationType {
  agent: AgentDoc;
  notification: NotificationOutput;
}
