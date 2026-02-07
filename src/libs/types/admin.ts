import { ObjectId } from "mongoose";
import { OrderRender } from "../enums/common.enum";
import { TariffStatus } from "../enums/payment.enum";
import { CommonPageInput } from "./common";

export interface AdminGetTariffsInput extends CommonPageInput {
  status: TariffStatus;
  sort: OrderRender;
}

export interface AdminChangeTariffStatusQuery {
  tariffId: ObjectId;
  status: TariffStatus;
}
