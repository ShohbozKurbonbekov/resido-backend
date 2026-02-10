import { ObjectId } from "mongoose";
import { OrderRender } from "../enums/common.enum";
import { TariffStatus } from "../enums/payment.enum";
import { CommonPageInput } from "./common";
import { MemberStatus, MemberType } from "../enums/member.enum";

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
