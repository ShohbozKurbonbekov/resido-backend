import { ObjectId } from "mongoose";
import { AgentApplicationStatus } from "../enums/agentApplication.enum";

export interface AgentApplication {
  _id: ObjectId;
  userId: ObjectId;
  agencyId: ObjectId;
  agentId: ObjectId;
  status: AgentApplicationStatus;
  reviewedBy: ObjectId;
  reviewedAt: Date;
  rejectionReason: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AgentApplicationInput = Pick<
  AgentApplication,
  "userId" | "agencyId" | "agentId"
>;

export type AgentApplicationUpdate = Partial<AgentApplication>;
