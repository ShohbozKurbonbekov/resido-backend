import { ObjectId } from "mongoose";
import {
  famousIndicatorField,
  FEATURED_SCORE,
  priceValueField,
} from "../libs/config";
import {
  PropertyStatus,
  PublicPropertiesSort,
  SellingTypeEnum,
} from "../libs/enums/property.enum";
import { T } from "../libs/types/common";
import { PublicPropertiesInput } from "../libs/types/properties";
import { Properties, PropertySearchFeatures } from "../libs/types/property";
import PropertiesModel, { Property } from "../schema/Property.model";
import likeTargetItem from "../libs/utils/likeTargetItem";
import { CacheKey, TTL } from "../libs/redis/cash.constants";
import { cacheGet, cacheSet } from "../libs/redis/cash.helpers";
import PropertyModel from "../schema/Property.model";
import properties from "../routers/properties.router";

class PropertiesService {
  private readonly propertiesModel;
  constructor() {
    this.propertiesModel = PropertiesModel;
  }

  static async updateRedisPropertiesKeys() {
    const [page, limit, direction] = [1, 6, -1];
    const properties = await Promise.all([
      PropertyModel.find({
        status: PropertyStatus.AVAILABLE,
        "sellingOption.optionRent.type": SellingTypeEnum.RENT,
      })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      PropertyModel.find({
        status: PropertyStatus.AVAILABLE,
        featuredScore: { $gte: FEATURED_SCORE },
      })
        .sort({ featuredScore: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    const keys = [
      CacheKey.recentProperties(
        page,
        limit,
        PublicPropertiesSort.createdAt,
        direction,
      ),
      CacheKey.featuredProperties(
        page,
        limit,
        PublicPropertiesSort.featuredScore,
        direction,
      ),
    ];

    for (const [i, key] of keys.entries()) {
      const ttl = key.startsWith("props:recent")
        ? TTL.RECENT_PROPERTIES
        : TTL.FEATURED_PROPERTIES;
      await cacheSet(key, properties[i], ttl);
    }
  }

  public async getProperties(
    input: PublicPropertiesInput,
    memberId: ObjectId | undefined,
  ): Promise<Properties> {
    const {
      page,
      limit,
      sort,
      direction,
      recentProperties,
      featuredProperties,
      search,
    } = input;
    // Build the match and sort objects based on the input
    const match: T = {
      status: PropertyStatus.AVAILABLE,
    };

    const propertySort: T = {
      [sort || "createdAt"]: direction || -1,
    };

    if (recentProperties || featuredProperties) {
      const key = recentProperties
        ? CacheKey.recentProperties(page, limit, sort, direction)
        : CacheKey.featuredProperties(page, limit, sort, direction);

      const cached = await cacheGet<Property[]>(key);
      if (cached)
        return {
          properties: cached || [],
          totalPropertiesNumber: [{ total: cached.length ?? 0 }],
        };

      const data = await this.fetchRedisCachedProperties(
        input,
        match,
        propertySort,
      );
      await cacheSet(
        key,
        data.properties,
        featuredProperties ? TTL.FEATURED_PROPERTIES : TTL.RECENT_PROPERTIES,
      );
      return data;
    }

    search && this.shapeMatchQuery(match, search);
    const [result] = await this.propertiesModel.aggregate([
      {
        $lookup: {
          from: "agents",
          localField: "agentId",
          foreignField: "_id",
          as: "agentData",
          pipeline: [{ $project: { fullName: 1, rank: 1, isVerified: 1 } }],
        },
      },
      { $unwind: "$agentData" },
      ...likeTargetItem(memberId),
      priceValueField,
      famousIndicatorField,
      { $match: match },
      { $sort: propertySort },
      {
        $facet: {
          properties: [{ $skip: (page - 1) * limit }, { $limit: limit }],
          totalPropertiesNumber: [{ $count: "total" }],
        },
      },
    ]);

    if (!result?.properties?.length) {
      return {
        properties: result?.properties || [],
        totalPropertiesNumber: result?.totalPropertiesNumber || [{ total: 0 }],
      };
    }
    return result;
  }
  // SHAPE THE QUERY
  private shapeMatchQuery(match: T, queries: PropertySearchFeatures): void {
    const {
      propertyType,
      propertySearch,
      propertyVerified,
      propertyAgentLevel,
      propertyAmenities,
      propertyBedrooms,
      propertyLocation,
      propertyMood,
      propertyPriceRange,
    } = queries;

    if (propertySearch?.trim()) {
      match.title = { $regex: propertySearch.trim(), $options: "i" };
    }

    if (propertyType) {
      match.propertyType = { $regex: propertyType, $options: "i" };
    }
    if (propertyBedrooms) {
      match.bedrooms =
        propertyBedrooms >= 6 ? { $gte: propertyBedrooms } : propertyBedrooms;
    }

    if (propertyMood) {
      match.mood = { $regex: propertyMood, $options: "i" };
    }
    if (propertyVerified === true || propertyVerified === false) {
      match["agentData.isVerified"] = propertyVerified;
    }

    if (propertyAgentLevel) {
      match["agentData.rank"] = propertyAgentLevel.trim();
    }

    if (propertyAmenities) {
      const amenityConditions = Object.entries(propertyAmenities)
        .filter(([_, value]) => value)
        .map(([key, value]) => ({ [`amenities.${key}`]: value }));

      if (amenityConditions.length) {
        match.$and = [...(match.$and || []), ...amenityConditions];
      }
    }

    if (propertyPriceRange) {
      const { start, end } = propertyPriceRange;
      match.$and = [
        ...(match.$and || []),
        {
          $or: [
            {
              "sellingOption.optionSell.overalAmunt": {
                $gte: start,
                $lte: end,
              },
            },
            {
              "sellingOption.optionRent.overalAmount": {
                $gte: start,
                $lte: end,
              },
            },
          ],
        },
      ];
    }

    if (propertyLocation?.trim()) {
      match.$and = [
        ...(match.$and || []),
        {
          $or: [
            {
              "address.city": {
                $regex: propertyLocation.trim(),
                $options: "i",
              },
            },
            {
              "address.street": {
                $regex: propertyLocation.trim(),
                $options: "i",
              },
            },
            {
              "address.country": {
                $regex: propertyLocation.trim(),
                $options: "i",
              },
            },
            {
              "address.district": {
                $regex: propertyLocation.trim(),
                $options: "i",
              },
            },
          ],
        },
      ];
    }
  }
  private async fetchRedisCachedProperties(
    input: PublicPropertiesInput,
    match: T,
    propertySort: T,
  ): Promise<Properties> {
    const { page, limit, recentProperties, featuredProperties } = input;

    if (recentProperties) {
      match["sellingOption.optionRent.type"] = SellingTypeEnum.RENT;
    }

    if (featuredProperties) {
      match.featuredScore = { $gte: FEATURED_SCORE };
    }

    const result = await this.propertiesModel
      .find(match)
      .sort(propertySort)
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      properties: result || [],
      totalPropertiesNumber: [{ total: result.length ?? 0 }],
    };
  }
}

export default PropertiesService;
