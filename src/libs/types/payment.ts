import {
  BillingCycle,
  TarrifCurrencyType,
  TarrifName,
  TarrifStatus,
} from "../enums/payment.enum";

export interface TarrifLimitsType {
  properties: number;
  agents: number;
}

export interface TarrifInputType {
  name: TarrifName;
  price: number;
  billingCycle: BillingCycle;
  features: string[];
  limits: TarrifLimitsType;
  currency: TarrifCurrencyType;
}
export interface TarrifServerSetInput {
  durationDays: number;
  status: TarrifStatus;
  createdAt: Date;
  updatedAt: Date;
}
export type TarrifSchemaType = TarrifInputType & TarrifServerSetInput;
