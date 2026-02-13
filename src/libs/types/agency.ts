import { ObjectId } from "mongoose";
import {
  AgencyCurrentBadge,
  AgencyStatus,
  AgencyTargetType,
  PaymentProvider,
  SubscriptionStatus,
  SubscriptionTarrif,
} from "../enums/agency.enum";
import { MemberStatus, MemberType } from "../enums/member.enum";
import { CommonPageInput, Social } from "./common";
import { Agent } from "./agent";
import { TotalCounter } from "./property";
import { Agency } from "../../schema/members/Agency.model";
import { Property } from "../../schema/Property.model";
import { BillingSnapShotType, TariffLimitsType } from "./payment";
import { BillingCycle } from "../enums/payment.enum";
import { AgencySubscriptionResult } from "../../schema/AgencySubscription.model";
import { AgentStatus } from "../enums/agent.enum";
import { Tariff } from "../../schema/Tariff.model";

export interface BillingDetails {
  planName: SubscriptionTarrif;
  subscriptionDate: Date;
  subscriptionStatus: SubscriptionStatus;
}
export interface AgencyToggleStateType {
  agents?: Agent[];
  properties?: Property[];
}

export interface AgencyInputs {
  userId: ObjectId;
  role: MemberType;
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  yearOfExperience: number;
  address: string;
  agencyOwner: string;
  registrationNumber: string;
  certificate: string;
  licenseNumber: string;
}

export interface AgencyAggregate extends AgencyInputs {
  // SERVER DEFAULT INPUTS
  views?: number;
  createdAt?: Date;
  updatedAt?: Date;
  memberStatus?: MemberStatus;
  currentStatus?: AgencyStatus;
  memberSince?: Date;
  featuredScore?: number;
  _id?: ObjectId;
  isVerified?: boolean;

  // STEP  =>  2 AFTER ADMIN CHECK
  permittedProperties?: number;
  permittedAgents?: number;

  // STEPT =>  3 =>  AGENCY OPTIONAL INPUTS
  socialLinks?: Social;
  avatar?: string;
  bioInfo?: string;

  // SET-BY-SERVER INPUTS FOR FRONT-END
  agencyBadge?: AgencyCurrentBadge;
  agencyItems?: AgencyToggleStateType;
  agentsTotalNumber?: number;
  propertiesTotalNumber?: number;
}

export type AgencyInputUpdate = Partial<Omit<AgencyInputs, "role" | "userId">> &
  Partial<Pick<AgencyAggregate, "socialLinks" | "avatar" | "bioInfo">>;

export interface AgencyResults {
  agencies: Agency[];
  totalNumbers: TotalCounter[];
}
export type SearchByLocationAgency = AgencyResults;

export interface AgencyAgePropertiesInput extends CommonPageInput {
  agencyTarget?: AgencyTargetType;
  location?: string;
}

export interface AgencyAgePropertiesResult {
  agency: Agency;
}

export interface AgencyPrivilegesType {
  permittedProperties: number;
  permittedAgents: number;
}

/////////////////  SUBSCRIPTIONS /////////////
export interface AgencySubscriptionSchemaInputs {
  agencyId: ObjectId;
  billingTariffId: ObjectId;

  amount: number;
  billingSnapshot: BillingSnapShotType;
  currency: string;
  paymentProvider: PaymentProvider;
  subscriptionStatus: SubscriptionStatus;

  stripeCustomerId?: string;
  stripeSubscriptionId?: string;

  billingName: string;
  billingEmail: string;
  billingCity: string;
  billingCountry: string;
  billingPostalCode: string;
  billingCyle: BillingCycle;

  updatedAt: Date;
  createdAt: Date;
  startedAt: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  lastPaymentAt: Date;
  nextPaymentAt: Date;
  cancelledAt: Date | null;
}

export type AgencyPaymentInfoInputs = Pick<
  AgencySubscriptionSchemaInputs,
  | "billingName"
  | "billingEmail"
  | "billingCity"
  | "billingCountry"
  | "billingPostalCode"
  | "billingTariffId"
>;

export type RequiredSubscribeInputs = Partial<AgencySubscriptionSchemaInputs>;

export interface AgencySubscriptionInfoType {
  tariffPlans: Tariff[];
  agencySubscription: AgencySubscriptionResult;
}

export type SubscriptionRenewType = Pick<
  AgencySubscriptionSchemaInputs,
  | "subscriptionStatus"
  | "cancelledAt"
  | "currentPeriodEnd"
  | "currentPeriodStart"
  | "lastPaymentAt"
  | "nextPaymentAt"
  | "billingSnapshot"
>;

export interface RenewSubscriptionInput {
  id: string;
  currentPeriodEnd: string;
  billingSnapshot: BillingSnapShotType;
}
export interface AgencyAgentsApplicationInput extends CommonPageInput {
  currentStatus: AgentStatus;
}

export interface AgencyDashboardBillingOverview {
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlanType: string;
}
export interface AgencyDashboardOverviewType {
  myProperties: TotalCounter;
  myNotifications: TotalCounter;
  myBillingInfo: AgencyDashboardBillingOverview;
  myAgents: TotalCounter;
  myBlogs: TotalCounter;
  messages: TotalCounter;
  totalViews: TotalCounter;
  generatedAt: Date | null;
}
