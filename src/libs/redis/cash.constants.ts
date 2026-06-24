import { PublicPropertiesSort } from "../enums/property.enum";

export const TTL = {
  RECENT_PROPERTIES: 2 * 60 * 60,
  FEATURED_PROPERTIES: 2 * 60 * 60,
} as const;

export const CacheKey = {
  recentProperties: (
    page: number,
    limit: number,
    sort: PublicPropertiesSort,
    direction: number,
  ) => `props:recent:p${page}:l${limit}:s${sort}:d${direction}`,

  featuredProperties: (
    page: number,
    limit: number,
    sort: PublicPropertiesSort,
    direction: number,
  ) => `props:featured:p${page}:l${limit}:s${sort}:d$${direction}`,
} as const;
