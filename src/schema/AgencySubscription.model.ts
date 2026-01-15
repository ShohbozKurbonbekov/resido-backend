import { Schema } from "mongoose";
import {
  PaymentProvider,
  SubscriptionStatus,
  SubscriptionTarrif,
} from "../libs/enums/agency.enum";
import { AgencySubscriptionInputs } from "../libs/types/agency";

const AgencySubscriptionSchema = new Schema<AgencySubscriptionInputs>({
  agencyId: {
    type: Schema.Types.ObjectId,
    ref: "agencies",
    required: true,
  },
  planName: {
    type: String,
    enum: SubscriptionTarrif,
    required: true,
  },

  billingName: { type: String, required: true },
  billingEmail: { type: String, required: true },
  billingAddress: { type: String, required: true },
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
  createdAt: { type: Date, default: Date.now },
});

AgencySubscriptionSchema.index({
  agencyId: 1,
});
