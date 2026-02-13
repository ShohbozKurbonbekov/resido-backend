import { ObjectId } from "mongoose";
import { OrderRender } from "../enums/common.enum";
import { TariffStatus } from "../enums/payment.enum";
import { CommonPageInput } from "./common";
import { MemberStatus, MemberType } from "../enums/member.enum";
import { TotalCounter } from "./property";

export interface AdminGetTariffsInput extends CommonPageInput {
  status: TariffStatus;
  sort: OrderRender;
}

export interface AdminChangeTariffStatusQuery {
  tariffId: ObjectId;
  status: TariffStatus;
}

export interface AdminGetAllMembersCategory {
  username?: string;
  memberType?: MemberType;
}
export interface AdminGetAllMembersType extends CommonPageInput {
  status?: MemberStatus;
  sort?: OrderRender;
  memberCategory?: AdminGetAllMembersCategory;
}

export interface AdminGlobalStatsType {
  properties: number;
  agents: number;
  users: number;
  agencies: number;
  blogs: number;
  comments: number;
  tariffs: number;
}

export interface AdminPersonalStatsType {
  notifications: number;
  myBlogs: number;
  myMessages: number;
}

export interface AdminDashboardOverviewType {
  adminId: ObjectId;
  globalStats: AdminGlobalStatsType;
  personalStats: AdminPersonalStatsType;
  generatedAt: Date;
}
