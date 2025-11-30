import UserSavingModel from "../schema/UserSaving.model";

class UserSaving {
  private readonly userSavingModel;
  constructor() {
    this.userSavingModel = UserSavingModel;
  }
}
export default UserSaving;
