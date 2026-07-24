import { T } from "../types/common";
import { PropertyInput } from "../types/property";
import { validateNumberValue } from "./validateNumber";

export const organizePropertyInput = (body: PropertyInput) => {
  let queries: T = {};
  if (body?.address) {
    queries.address =
      typeof body.address === "string"
        ? JSON.parse(body.address)
        : body.address;
  }
  if (body?.title) {
    queries.title = body.title.trim();
  }
  if (body?.sellingOption) {
    queries.sellingOption =
      typeof body.sellingOption === "string"
        ? JSON.parse(body.sellingOption)
        : body.sellingOption;
  }
  if (body?.floors) {
    queries.floors = validateNumberValue(body.floors);
  }
  if (body?.propertyType) {
    queries.propertyType = body.propertyType;
  }

  if (body.area) {
    queries.area = validateNumberValue(body.area);
  }

  if (body?.bathrooms) {
    queries.bathrooms = validateNumberValue(body.bathrooms);
  }

  if (body?.bedrooms) {
    queries.bedrooms = validateNumberValue(body.bedrooms);
  }
  if (body?.hall) {
    queries.hall = validateNumberValue(body.hall);
  }
  if (body?.kitchen) {
    queries.kitchen = validateNumberValue(body.kitchen);
  }
  if (body?.description) {
    queries.description = body.description.trim();
  }
  if (body?.heating) {
    queries.heating = body.heating;
  }

  if (body?.cooling) {
    queries.cooling = body.cooling;
  }

  if (body?.furnished) {
    queries.furnished = body.furnished;
  }

  if (body?.security) {
    queries.security = body.security;
  }
  if (body?.yearBuilt) {
    queries.yearBuilt = validateNumberValue(body.yearBuilt);
  }
  if (body?.garageSpace) {
    queries.garageSpace = validateNumberValue(body.garageSpace);
  }
  if (body?.amenities) {
    queries.amenities =
      typeof body.amenities === "string"
        ? JSON.parse(body.amenities)
        : body.amenities;
  }

  if (body?.nearBySchools) {
    queries.nearBySchools = body.nearBySchools;
  }
  if (body?.nearByTransports) {
    queries.nearByTransports = body.nearByTransports;
  }
  if (body?.mood) {
    queries.mood = body.mood;
  }

  if (body?.firePlace) {
    queries.firePlace = body.firePlace;
  }

  return queries as PropertyInput;
};
