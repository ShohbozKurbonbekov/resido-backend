import mongoose, { InferSchemaType, Schema } from "mongoose";
import { TariffLimitsType, TariffSchemaType } from "../libs/types/payment";
import {
  BillingCycle,
  TariffCurrencyType,
  TariffStatus,
} from "../libs/enums/payment.enum";

export const TariffLimitsSchema = new Schema<TariffLimitsType>(
  {
    agents: {
      type: Number,
      required: true,
      min: 0,
    },
    properties: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

const TariffSchema = new Schema<TariffSchemaType>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    billingCycle: {
      type: String,
      enum: BillingCycle,
      required: true,
    },
    features: {
      type: [String],
      required: true,
      validate: [(v: string[]) => v.length > 0, "Featured required"],
    },

    limits: {
      type: TariffLimitsSchema,
      required: true,
    },
    currency: {
      type: String,
      enum: TariffCurrencyType,
      default: TariffCurrencyType.USD,
    },
    durationDays: {
      type: Number,
      default: 30,
    },
    status: {
      type: String,
      enum: TariffStatus,
      default: TariffStatus.ACTIVE,
    },
  },
  {
    timestamps: true,
    collection: "PaymentTarrifs",
  },
);

TariffSchema.index({
  _id: 1,
  status: 1,
  name: 1,
});

export type Tariff = InferSchemaType<typeof TariffSchema>;

export default mongoose.model("Tarrif", TariffSchema);
