import PropertyModel from "../schema/Property.model";
class Property {
  private readonly propertyModel;
  constructor() {
    this.propertyModel = PropertyModel;
  }
}
export default Property;
