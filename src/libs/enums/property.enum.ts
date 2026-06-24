export enum PropertyType {
  HOUSE = "house",
  OFFICE_DESK = "office desk",
  VILLA = "villa",
  APARTMENT = "apartment",
  CONDO = "condo",
  DENVER = "denver",
  STUDIO = "studio",
}

export enum PropertyHeating {
  CENTRAL = "central",
  FLOOR = "floor",
  GAS = "gas",
}
export enum PropertyFurnature {
  FULL = "full",
  PARTIAL = "partial",
  NONE = "none",
}
export enum PropertyCooling {
  CENTRAL = "central",
  SPLIT = "split",
  WINDOW = "window",
  NONE = "none",
}

export enum PropertySecurity {
  None = "none",
  Basic = "basic",
  High = "high",
}
export enum PropertyStatus {
  DRAFT = "draft",
  PENDING_APPROVAL = "pending_approval",
  REJECTED = "rejected",
  AVAILABLE = "available",
  RENTED = "rented",
  SOLD = "sold",
  ARCHIVED = "archived",
  DELETED = "deleted",
}

export enum SellingTypeEnum {
  RENT = "RENT",
  SALE = "SALE",
}

export enum PropertyMood {
  Cozy = "Cozy",
  Modern = "Modern",
  Natural = "Natural",
  Urban = "Urban",
  Relaxing = "Relaxing",
  Artistic = "Artistic",
  Professional = "Professional",
}
export enum MajorCites {
  Seoul = "Seoul",
  Incheon = "Incheon",
  Busan = "Busan",
  Daegu = "Daegu",
  Daejeon = "Daejeon",
  Gwangju = "Gwangju",
  Ulsan = "Ulsan",
  Sejong = "Sejong",
  Jeju = "Jeju",
}

export enum PropertySortOrder {
  LOW_PRICE = "low_price",
  HIGH_PRICE = "high_price",
  MOST_FAMOUS = "most_famous",
}

export enum PublicPropertiesSort {
  createdAt = "createdAt",
  priceValue = "priceValue",
  famousIndicator = "famousIndicator",
  featuredScore = "featuredScore",
}
