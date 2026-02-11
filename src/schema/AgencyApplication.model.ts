import mongoose, { InferSchemaType, Schema } from "mongoose";
import { AgencyApplication } from "../libs/types/agencyApplication";
import { AgencyApplicationStatus } from "../libs/enums/agencyApplication.enum";

const AgencyApplicationSchema = new Schema<AgencyApplication>(
  {
    agencyId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    userId: {
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
      enum: AgencyApplicationStatus,
      default: AgencyApplicationStatus.APPLIED,
    },
  },
  { timestamps: true, collection: "agencyApplications" },
);

AgencyApplicationSchema.index({ userId: 1, status: 1, agencyId: 1 });
export type AgencyApplicationOutput = InferSchemaType<
  typeof AgencyApplicationSchema
>;
export default mongoose.model("agencyApplication", AgencyApplicationSchema);
