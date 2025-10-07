import mongoose, { InferSchemaType, Schema } from "mongoose";
import { ViewGroup } from "../libs/enums/view.enum";
import { View } from "../libs/types/view";

const ViewSchema = new Schema<View>(
  {
    viewGroup: {
      type: String,
      enum: ViewGroup,
      required: true,
    },

    viewTargetId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true }
);

export type ViewDocs = InferSchemaType<typeof ViewSchema>;
export default mongoose.model<ViewDocs>("View", ViewSchema);
