import { Tariff } from "../../schema/Tariff.model";
import { BillingCycle, TariffStatus } from "../enums/payment.enum";
import { ToString } from "./common";
import { TotalCounter } from "./property";

export interface TariffLimitsType {
  properties: number;
  agents: number;
}

export interface TariffInputType {
  name: string;
  price: number;
  billingCycle: BillingCycle;
  features: string[];
  limits: TariffLimitsType;
  currency: string;
}

export type AdminAddTariffInput = Omit<TariffInputType, "price" | "limits"> & {
  price: string;
  limits: ToString<TariffLimitsType, "agents" | "properties">;
};
export interface TariffServerSetInput {
  durationDays: number;
  status: TariffStatus;
  createdAt: Date;
  updatedAt: Date;
}
export type TariffSchemaType = TariffInputType & TariffServerSetInput;

export interface TariffOutputType {
  paymentTariffs: Tariff[];
  metaCounter: TotalCounter[];
}

export interface BillingSnapShotType {
  name: String;
  features: string[];
  limit: TariffLimitsType;
  usage: TariffLimitsType;
}
