import { T } from "../types/common";
import { PropertyInquery, PropertySearchFeatures } from "../types/property";

export const buildPropertyInquery = (queries: PropertyInquery) => {
  const query: T = {};

  const { page, limit, order, search } = queries;

  if (page) {
    query.page = Number(queries.page) || 1;
  }
  if (limit) {
    query.limit = Number(queries.limit) || 4;
  }
  if (order) {
    query.order = queries.order;
  }

  if (!search) return query;

  if (
    search.propertyAmenities &&
    typeof search.propertyAmenities === "object" &&
    Object.keys(search.propertyAmenities).length
  ) {
    query.amenities = search.propertyAmenities;
  }
  if (search.propertyBedrooms) {
    query.bedrooms = search.propertyBedrooms;
  }
  if (search.propertyLocation?.trim()) {
    query.address = search.propertyLocation;
  }
  if (search.propertyMood?.trim()) {
    query.mood = search.propertyMood;
  }
  if (
    search.propertyPriceRange &&
    typeof search.propertyPriceRange === "object" &&
    Object.keys(search).length
  ) {
    query.price = search.propertyPriceRange;
  }
  if (search.propertySearch?.trim()) {
    query.title = search.propertySearch;
  }
  if (search.propertyAgentLevel?.trim()) {
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
