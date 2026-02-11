import { ObjectId } from "mongoose";
import { AgencyApplicationStatus } from "../enums/agencyApplication.enum";

export interface AgencyApplication {
  _id: ObjectId;
  userId: ObjectId;
  agencyId: ObjectId;
  status: AgencyApplicationStatus;
  reviewedBy: ObjectId;
  reviewedAt: Date;
  rejectionReason: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AgencyApplicationInput = Pick<
  AgencyApplication,
  "userId" | "agencyId"
>;

export type AgencyApplicationUpdate = Partial<AgencyApplication>;
