import mongoose, { InferSchemaType, Schema } from "mongoose";
import {
  NotificationPayload,
  NotificationCreation,
} from "../libs/types/notification";
import { MemberType } from "../libs/enums/member.enum";
import {
  NotificationEntityType,
  NotificationType,
} from "../libs/enums/notification.enum";

const NotificationPayloadSchema = new Schema<NotificationPayload>(
  {
    rejectorName: {
      type: String,
    },
    reason: {
      type: String,
    },
  },
  { _id: false },
);

export const NotificationSchema = new Schema<NotificationCreation>(
  {
    actionRequired: {
      type: Boolean,
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    entityType: {
      type: String,
      enum: NotificationEntityType,
      required: true,
    },
    payload: {
      type: NotificationPayloadSchema,
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    recipientRole: {
      type: String,
      enum: MemberType,
      required: true,
    },
    type: {
      type: String,
      enum: NotificationType,
      required: true,
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

NotificationSchema.index({
  recipientId: 1,
  entityType: 1,
  type: 1,
  recipientRole: 1,
  createdAt: 1,
});
export type NotificationOutput = InferSchemaType<typeof NotificationSchema>;
export default mongoose.model("Notification", NotificationSchema);
