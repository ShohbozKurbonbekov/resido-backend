import Errors, { HttpCode, Message } from "../libs/Errors";
import { View, ViewInput } from "../libs/types/view";
import ViewModel, { ViewDocs } from "../schema/View.model";

class ViewService {
  private readonly viewModel;
  constructor() {
    this.viewModel = ViewModel;
  }

  public async checkViewExistance(input: ViewInput): Promise<ViewDocs | null> {
    const { userId, viewTargetId } = input;
    const result = await this.viewModel
      .findOne({
        userId,
        viewTargetId,
      })
      .lean()
      .exec();

    return result;
  }

  public async insertUserView(input: ViewInput): Promise<ViewDocs> {
    try {
      const result = await this.viewModel.create(input);
      return result;
    } catch (error) {
      console.log("Error in insertUserView: ", error);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATING_FAILED);
    }
  }
}
export default ViewService;
