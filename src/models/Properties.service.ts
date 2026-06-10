import { ObjectId } from "mongoose";
import {
  famousIndicatorField,
  FEATURED_SCORE,
  priceValueField,
} from "../libs/config";
import { PropertyStatus, SellingTypeEnum } from "../libs/enums/property.enum";
import { T } from "../libs/types/common";
import { PublicPropertiesInput } from "../libs/types/properties";
import { Properties, PropertySearchFeatures } from "../libs/types/property";
import PropertiesModel from "../schema/Property.model";
import likeTargetItem from "../libs/utils/likeTargetItem";

class PropertiesService {
  private readonly propertiesModel;
  constructor() {
    this.propertiesModel = PropertiesModel;
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

    if (recentProperties) {
      match["sellingOption.optionRent.type"] = SellingTypeEnum.RENT;
    }

    if (featuredProperties) {
      match.featuredScore = { $gte: FEATURED_SCORE };
    }

    if (search) {
      this.shapeMatchQuery(match, search);
    }

    const [result] = await this.propertiesModel.aggregate([
      ...(search
        ? [
            {
              $lookup: {
                from: "agents",
                localField: "agentId",
                foreignField: "_id",
                as: "agentData",
                pipeline: [
                  { $project: { fullName: 1, rank: 1, isVerified: 1 } },
                ],
              },
            },
            { $unwind: "$agentData" },
            ...likeTargetItem(memberId),
            priceValueField,
            famousIndicatorField,
          ]
        : []),
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

    if (propertyMood?.trim()) {
      match.mood = { $regex: propertyMood, $options: "i" };
    }
    if (propertyVerified === true || propertyVerified === false) {
      match["agentData.isVerified"] = propertyVerified;
    }

    if (propertyAgentLevel?.trim()) {
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
}

export default PropertiesService;
