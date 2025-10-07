import { T } from "../types/common";
import { PropertyInquery, PropertySearchFeatures } from "../types/property";

export const buildPropertyInquery = (queries: PropertyInquery) => {
  const query: Record<string, any> = {};

  const { page, limit, order, search } = queries;

  if (page) {
    query.page = Number(queries.page);
  }
  if (limit) {
    query.limit = Number(queries.limit);
  }
  if (order) {
    query.order = queries.order;
  }

  if (!search) return query;

  if (search.propertyAmenities) {
    query.amenities = search.propertyAmenities;
  }
  if (search.propertyBedrooms) {
    query.bedrooms = search.propertyBedrooms;
  }
  if (search.propertyLocation) {
    query.address = search.propertyLocation;
  }
  if (search.propertyMood) {
    query.mood = search.propertyMood;
  }
  if (search.propertyPriceRange) {
    query.price = search.propertyPriceRange;
  }
  if (search.propertySearch) {
    query.title = search.propertySearch;
  }
  if (search.propertyAgentLevel) {
    query.rank = search.propertyAgentLevel;
  }
  if (search.propertyType) {
    query.propertyType = search.propertyType;
  }
  if (search.propertyVerified) {
    query.propertyVerified = search.propertyVerified;
  }

  return query;
};
export default buildPropertyInquery;
