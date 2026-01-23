import mongoose, { InferSchemaType, Schema } from "mongoose";
import { AgentApplication } from "../libs/types/agentApplication";
import { AgentApplicationStatus } from "../libs/enums/agentApplication.enum";

const AgentApplicationSchema = new Schema<AgentApplication>(
  {
    agencyId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    agentId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    rejectionReason: {
      type: String,
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
    },
    status: {
      type: String,
      enum: AgentApplicationStatus,
      default: AgentApplicationStatus.APPLIED,
    },
  },
  { timestamps: true, collection: "agentApplication" },
);

AgentApplicationSchema.index({ userId: 1, status: 1, agencyId: 1 });
export type AgentApplicationOutput = InferSchemaType<
  typeof AgentApplicationSchema
>;
export default mongoose.model("agentApplication", AgentApplicationSchema);
