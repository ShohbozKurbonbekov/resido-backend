import { shapeIntoMongooseObjectId } from "../libs/config";
import { PublicPropertiesSort } from "../libs/enums/property.enum";
import Errors, { HttpCode } from "../libs/Errors";
import { T } from "../libs/types/common";
import { PublicPropertiesInput } from "../libs/types/properties";
import { PropertySearchFeatures } from "../libs/types/property";
import { ExtendedRequest } from "../libs/types/user";
import PropertiesService from "../models/Properties.service";
import { Request, Response } from "express";

const propertiesController: T = {};
const propertiesService = new PropertiesService();

propertiesController.getProperties = async (
  req: ExtendedRequest,
  res: Response,
) => {
  console.log("getProperties process");
  try {
    const memberId = shapeIntoMongooseObjectId(req.member?._id);
    const {
      limit,
      page,
      featuredProperties,
      recentProperties,
      sort,
      direction,
      search,
    } = req.query;
    const query: PublicPropertiesInput = {
      page: Math.max(1, Number(page) || 1),
      limit: Math.max(1, Number(limit) || 10),
      sort: sort as PublicPropertiesSort,
      direction: isFinite(Number(direction)) ? Number(direction) : -1,
    };

    if (recentProperties) {
      query.recentProperties = recentProperties === "true" ? true : false;
    }

    if (featuredProperties) {
      query.featuredProperties = featuredProperties === "true" ? true : false;
    }

    if (search) {
      propertiesController.createSearchQuery(query, search);
    }

    const result = await propertiesService.getProperties(query, memberId);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in getProperties controller:", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

propertiesController.createSearchQuery = (
  query: PublicPropertiesInput,
  search: PropertySearchFeatures,
): PublicPropertiesInput => {
  if (search) {
    query.search = {};
    if (
      search?.propertyAmenities &&
      typeof search.propertyAmenities === "object" &&
      Object.keys(search.propertyAmenities).length
    ) {
      query.search.propertyAmenities = search.propertyAmenities;
    }
    if (search?.propertyBedrooms) {
      query.search.propertyBedrooms = Number(search.propertyBedrooms);
    }
    if (search?.propertyLocation?.trim()) {
      query.search.propertyLocation = search.propertyLocation;
    }
    if (search?.propertyMood) {
      query.search.propertyMood = search.propertyMood;
    }
    if (
      search?.propertyPriceRange &&
      typeof search.propertyPriceRange === "object" &&
      Object.keys(search.propertyPriceRange).length
    ) {
      query.search.propertyPriceRange = search.propertyPriceRange;
    }
    if (search?.propertySearch?.trim()) {
      query.search.propertySearch = search.propertySearch;
    }
    if (search?.propertyAgentLevel?.trim()) {
      query.search.propertyAgentLevel = search.propertyAgentLevel;
    }
    if (search?.propertyType) {
      query.search.propertyType = search.propertyType;
    }
    if (search.propertyVerified) {
      query.search.propertyVerified =
        search.propertyVerified === "true" ? true : false;
    }
  }

  return query;
};

export default propertiesController;
