import mongoose, { InferSchemaType, Schema } from "mongoose";
import {
  PaymentProvider,
  SubscriptionStatus,
  SubscriptionTarrif,
} from "../libs/enums/agency.enum";
import { AgencySubscriptionSchemaInputs } from "../libs/types/agency";
import { BillingSnapShotType } from "../libs/types/payment";
import { TarrifLimitsSchema } from "./Tarrif.model";
import { TarrifCurrencyType } from "../libs/enums/payment.enum";

const BillingSnapshotSchema = new Schema<BillingSnapShotType>({
  features: {
    type: [String],
    required: true,
    validate: [(v: string[]) => v.length > 0, "Featured required"],
  },
  limit: {
    type: TarrifLimitsSchema,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

const AgencySubscriptionSchema = new Schema<AgencySubscriptionSchemaInputs>(
  {
    agencyId: {
      type: Schema.Types.ObjectId,
      ref: "agencies",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    billingSnapshot: {
      type: BillingSnapshotSchema,
      required: true,
    },
    currency: {
      type: String,
      enum: TarrifCurrencyType,
      required: true,
    },

    billingName: { type: String, required: true },
    billingEmail: { type: String, required: true },
    billingCity: { type: String, required: true },
    billingPostalCode: {
      type: String,
      required: true,
    },
    billingCountry: {
      type: String,
      required: true,
    },
    paymentProvider: {
      type: String,
      enum: PaymentProvider,
      default: PaymentProvider.MANUAL,
    },
    subscriptionStatus: {
      type: String,
      enum: SubscriptionStatus,
      default: SubscriptionStatus.ACTIVE,
    },

    stripeCustomerId: {
      type: String,
    },
    stripeSubscriptionId: {
      type: String,
    },
    cancelledAt: {
      type: Date,
    },
    currentPeriodEnd: {
      type: Date,
      required: true,
    },
    currentPeriodStart: {
      type: Date,
      required: true,
    },
    lastPaymentAt: {
      type: Date,
      required: true,
    },

    nextPaymentAt: {
      type: Date,
      required: true,
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "agencySubscriptions",
  },
);

AgencySubscriptionSchema.index(
  {
    agencyId: 1,
  },
  { unique: true },
);

export type AgencySubscriptionResult = InferSchemaType<
  typeof AgencySubscriptionSchema
>;
export default mongoose.model<AgencySubscriptionResult>(
  "AgencySubscription",
  AgencySubscriptionSchema,
);
