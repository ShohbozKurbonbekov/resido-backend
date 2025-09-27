import {
  Property,
  PropertyDocument,
  PropertyInput,
} from "../libs/types/property";
import PropertyModel from "../schema/Property.model";
import Errors, { HttpCode, Message } from "../libs/Errors";
class PropertyService {
  private readonly propertyModel;
  constructor() {
    this.propertyModel = PropertyModel;
  }

  public async createProperty(input: PropertyInput): Promise<PropertyDocument> {
    try {
      const result = await this.propertyModel.create(input);
      return result;
    } catch (error) {
      console.log("Error: in createProduct Model ", error);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATING_FAILED);
    }
  }
}
export default PropertyService;
