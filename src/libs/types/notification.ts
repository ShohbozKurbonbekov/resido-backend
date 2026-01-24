import { ObjectId } from "mongoose";
import { MemberType } from "../enums/member.enum";
import {
  AgentNotificationEntityType,
  AgentNotificationType,
} from "../enums/notification.enum";
import { NotificationOutput } from "../../schema/Notification.model";
import { TotalCounter } from "./property";

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
}

export type AgentNotificationInput = Omit<AgentNotificationCreation, "payload">;

export interface MyNotifications {
  notifications: NotificationOutput[];
  metaCounter: TotalCounter[];
}
