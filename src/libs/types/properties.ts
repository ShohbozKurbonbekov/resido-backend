import { OrderRender } from "../enums/common.enum";
import { PropertySearchFeatures } from "./property";

export interface PublicPropertiesInput {
  page: number;
  limit: number;
  sort: OrderRender;
  direction: number;
  search?: PropertySearchFeatures;
  recentProperties?: boolean;
  featuredProperties?: boolean;
}
