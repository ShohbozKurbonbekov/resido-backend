import { OrderRender } from "../enums/common.enum";
import { PublicPropertiesSort } from "../enums/property.enum";
import { PropertySearchFeatures } from "./property";

export interface PublicPropertiesInput {
  page: number;
  limit: number;
  sort: PublicPropertiesSort;
  direction: number;
  search?: PropertySearchFeatures;
  recentProperties?: boolean;
  featuredProperties?: boolean;
}
