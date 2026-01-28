import { ObjectId } from "mongoose";
import { MemberType } from "../enums/member.enum";
import {
  AgentNotificationEntityType,
  AgentNotificationType,
} from "../enums/notification.enum";
import { NotificationOutput } from "../../schema/Notification.model";
import { TotalCounter } from "./property";
import { AgentDoc } from "../../schema/members/Agent.model";
export interface AgentApprovePayload {
  agencyName: string;
}

export interface AgentRejectedPayload {
  reason: string;
}

export type AgentNotificationPayload =
  | AgentApprovePayload
  | AgentRejectedPayload
  | null;

export interface AgentNotificationCreation {
  recipientId: ObjectId;
  recipientRole: MemberType;
  type: AgentNotificationType;
  entityType: AgentNotificationEntityType;
  entityId: ObjectId;
  actionRequired: boolean;
  payload: AgentNotificationPayload;
  resolvedAt?: ObjectId;
}

export type AgentNotificationInput = Omit<
  AgentNotificationCreation,
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
