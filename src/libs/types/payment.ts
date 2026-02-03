import { Tariff } from "../../schema/Tariff.model";
import {
  BillingCycle,
  TariffCurrencyType,
  TariffName,
  TariffStatus,
} from "../enums/payment.enum";
import { TotalCounter } from "./property";

export interface TariffLimitsType {
  properties: number;
  agents: number;
}

export interface TariffInputType {
  name: TariffName;
  price: number;
  billingCycle: BillingCycle;
  features: string[];
  limits: TariffLimitsType;
  currency: TariffCurrencyType;
}
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
  name: TariffName;
  features: string[];
  limit: TariffLimitsType;
  usage: TariffLimitsType;
}
