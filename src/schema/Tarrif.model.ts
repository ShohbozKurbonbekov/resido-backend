import { unique } from "agenda/dist/job/unique";
import mongoose, { InferSchemaType, Schema } from "mongoose";
import { TarrifLimitsType, TarrifSchemaType } from "../libs/types/payment";
import {
  BillingCycle,
  TarrifCurrencyType,
  TarrifStatus,
} from "../libs/enums/payment.enum";

const TarrifLimitsSchema = new Schema<TarrifLimitsType>(
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

const TarriffSchema = new Schema<TarrifSchemaType>(
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
      type: TarrifLimitsSchema,
      required: true,
    },
    currency: {
      type: String,
      enum: TarrifCurrencyType,
      default: TarrifCurrencyType.USD,
    },
    durationDays: {
      type: Number,
      default: 30,
    },
    status: {
      type: String,
      enum: TarrifStatus,
      default: TarrifStatus.ACTIVE,
    },
  },
  {
    timestamps: true,
    collection: "PaymentTarrifs",
  },
);

TarriffSchema.index({
  _id: 1,
  status: 1,
  name: 1,
});

export type Tarrif = InferSchemaType<typeof TarriffSchema>;

export default mongoose.model("Tarrif", TarriffSchema);
