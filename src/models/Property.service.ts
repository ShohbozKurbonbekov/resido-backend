import {
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
  public async getAllProperties(inquery: PropertyInquery): Promise<Property[]> {
    const match: T = {
      status: PropertyStatus.AVAILABLE,
    };

    const properties: Property[] =
      inquery?.order.toLowerCase() === PropertySortOrder.LOW_PRICE
        ? await this.sortPropertiesAccordingPrice("asc", inquery, match)
        : await this.sortPropertiesAccordingPrice("desc", inquery, match);

    return properties;
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
