import {
  Properties,
  Property,
  PropertyDocument,
  PropertyInput,
  PropertyInquery,
  RecentPropertyForRent,
  RecentPropertyResult,
} from "../libs/types/property";
import PropertyModel from "../schema/Property.model";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { PropertySortOrder, PropertyStatus } from "../libs/enums/property.enum";
import { T } from "../libs/types/common";
import { text } from "stream/consumers";
class PropertyService {
  private readonly propertyModel;
  constructor() {
    this.propertyModel = PropertyModel;
  }

  // CREATE PROPERTY
  public async createProperty(input: PropertyInput): Promise<PropertyDocument> {
    try {
      const result = await this.propertyModel.create(input);
      return result;
    } catch (error) {
      console.log("Error: in createProduct Model ", error);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATING_FAILED);
    }
  }

  // GET RECENT PROPERTY FOR RENT
  public async getRecentPropertiesForRent(
    input: RecentPropertyForRent
  ): Promise<RecentPropertyResult> {
    const [properties, totalPropertiesNumber]: any[] = await Promise.all([
      this.propertyModel
        .find({ "sellingOption.optionRent.type": "RENT" })
        .sort({
          createdAt: -1,
        })
        .skip((input.page - 1) * input.limit)
        .limit(input.limit)
        .lean()
        .exec(),
      this.propertyModel
        .countDocuments({
          "sellingOption.optionRent.type": "RENT",
        })
        .lean()
        .exec(),
    ]);
    if (!properties.length) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }
    return { properties, totalPropertiesNumber };
  }

  // GET FEATURED PROPERTY
  public async getFeaturedProperty(
    input: RecentPropertyForRent
  ): Promise<RecentPropertyResult> {
    const [properties, totalPropertiesNumber] = await Promise.all([
      this.propertyModel
        .find({
          status: PropertyStatus.AVAILABLE,
          featuredScore: {
            $gte: 0.5,
          },
        })
        .sort({
          featuredScore: -1,
        })
        .skip((input.page - 1) * input.limit)
        .limit(input.limit)
        .lean()
        .exec(),
      this.propertyModel
        .countDocuments({
          status: PropertyStatus.AVAILABLE,
          featuredScore: {
            $gte: 0.5,
          },
        })
        .exec(),
    ]);

    if (!properties.length) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }
    return {
      properties,
      totalPropertiesNumber,
    };
  }

  // GET ALL PROPERTIES
  public async getAllProperties(queries: T): Promise<Properties> {
    const match: T = {
      status: PropertyStatus.AVAILABLE,
    };

    this.shapeMatchQuery(match, queries);

    const result = await this.propertyModel.aggregate([
      { $match: match },
      {
        $sort: { createdAt: -1 },
      },
      {
        $facet: {
          properties: [
            {
              $skip: (queries.page - 1) * queries.limit,
            },
            { $limit: queries.limit },
          ],
          metaCounter: [{ $count: "total" }],
        },
      },
    ]);

    if (!result.length) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }
    return result[0];
  }

  // SHAPE THE QUERY
  private shapeMatchQuery(match: T, queries: T): void {
    const {
      amenities,
      bedrooms,
      address,
      mood,
      price,
      title,
      propertySuperAgent,
      propertyType,
      propertyVerified,
    } = queries;

    if (title) {
      match.title = { $regex: new RegExp(title, "i") };
    }
    if (address) {
      match["address.city"] = { $regex: new RegExp(address, "i") };
    }
    if (propertyType) {
      match.propertyType = {
        $regex: new RegExp(propertyType, "i"),
      };
    }
    if (bedrooms) {
      match.bedrooms = bedrooms >= 6 ? { $gte: bedrooms } : bedrooms;
    }

    if (mood) {
      match.mood = { $regex: new RegExp(mood, "i") };
    }
    if (price) {
      const { start, end } = price;
      match.$or = [
        { "sellingOption.optionSell.overalAmunt": { $gte: start, $lte: end } },
        {
          "sellingOption.optionRent.overalAmount": { $gte: start, $lte: end },
        },
      ];
    }
    if (amenities) {
      match.$and = Object.entries(amenities)
        .filter(([_, value]) => value)
        .map(([key, value]) => ({ [`amenities.${key}`]: value }));
    }
  }

  // SORT PROPERTIS ACCORDING TO THEIR PRICE
  private async sortPropertiesAccordingPrice(
    order: "asc" | "desc",
    inquery: PropertyInquery,
    match: T
  ): Promise<Property[]> {
    const properties = await this.propertyModel.aggregate([
      { $match: match },
      {
        $addFields: {
          priceValue: {
            $ifNull: [
              "$sellingOption.optionRent.overalAmount",
              "$sellingOption.optionSell.overalAmunt",
            ],
          },
        },
      },
      { $sort: { priceValue: order === "asc" ? 1 : -1 } },
      { $skip: (inquery.page - 1) * inquery.limit },
      { $limit: inquery.limit },
    ]);
    return properties;
  }
}
export default PropertyService;
