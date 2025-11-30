import { TargetGroup } from "../libs/enums/userSaving.enum";
import { T } from "../libs/types/common";
import { SavingInput } from "../libs/types/userSaving";
import UserSavingModel, { SavingOutput } from "../schema/UserSaving.model";
import Errors, { HttpCode, Message } from "../libs/Errors";

class UserSaving {
  private readonly userSavingModel;
  constructor() {
    this.userSavingModel = UserSavingModel;
  }

  //  TOGGLE SAVE
  public async toggleSave(query: SavingInput): Promise<number> {
    const exist: SavingOutput | null = await this.userSavingModel.findOne(
      query
    );

    let modifier: number = 1;
    if (exist) {
      await this.userSavingModel.findOneAndDelete(query);
      modifier = -1;
    } else {
      try {
        await this.userSavingModel.create(query);
      } catch (error) {
        console.log("Error in UserSaving service: ", error);
        throw new Errors(HttpCode.BAD_REQUEST, Message.CREATING_FAILED);
      }
    }

    return modifier;
  }
}
export default UserSaving;
