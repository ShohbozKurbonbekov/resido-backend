import { T } from "../types/common";
import { PropertyFrontEnd } from "../types/property";

export const handlePropertyFrontEndInput = (body: T) => {
  let queries: T = {};

  if (body.address) {
    queries.address = JSON.parse(body.address);
  }
  if (body.title) {
    queries.title = body.title;
  }
  if (body.sellingOption) {
    queries.sellingOption = JSON.parse(body.sellingOption);
  }
  if (body.floors) {
    queries.floors = Number(body.floors);
  }
  if (body.propertyType) {
    queries.propertyType = body.propertyType;
  }

  if (body.area) {
    queries.area = Number(body.area);
  }

  if (body.bathrooms) {
    queries.bathrooms = Number(body.bathrooms);
  }

  if (body.bedrooms) {
    queries.bedrooms = Number(body.bedrooms);
  }
  if (body.hall) {
    queries.hall = Number(body.hall);
  }
  if (body.kitchen) {
    queries.kitchen = Number(body.kitchen);
  }
  if (body.description) {
    queries.description = body.description;
  }
  if (body.heating) {
    queries.heating = body.heating;
  }

  if (body.cooling) {
    queries.cooling = body.cooling;
  }

  if (body.furnished) {
    queries.furnished = body.furnished;
  }

  if (body.security) {
    queries.security = body.security;
  }
  if (body.yearBuilt) {
    queries.yearBuilt = Number(body.yearBuilt);
  }
  if (body.garageSpace) {
    queries.garageSpace = Number(body.garageSpace);
  }
  if (body.amenities) {
    queries.amenities = JSON.parse(body.amenities);
  }

  if (body.nearBySchools) {
    queries.nearBySchools = body.nearBySchools === "true";
  }
  if (body.nearByTransports) {
    queries.nearByTransports = body.nearByTransports === "true";
  }
  if (body.mood) {
    queries.mood = body.mood;
  }

  if (body.firePlace) {
    queries.firePlace = body.firePlace === "true";
  }

  return queries;
};
