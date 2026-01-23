import { ObjectId } from "mongoose";
import { MemberType } from "../enums/member.enum";
import { AgentNotificationType } from "../enums/notification.enum";
import { AgentNotificationEntityType } from "../enums/agentApplication.enum";

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
