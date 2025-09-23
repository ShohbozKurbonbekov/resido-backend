import Errors, { Message } from "../libs/Errors";
import { UserMemberInput, User } from "../libs/types/member";
import UserModel from "../schema/user.model";
import { HttpCode } from "../libs/Errors";

class MemberService {
  private readonly userModel;
  constructor() {
    this.userModel = UserModel;
  }

  public async userSignup(input: UserMemberInput): Promise<User> {
    try {
      const result = await this.userModel.create(input);

      return result.toObject();
    } catch (error) {
      console.log("Error in userSignup service model");
      throw new Errors(HttpCode.BAD_REQUEST, Message.USED_USERNAME_PHONE);
    }
  }
}

export default MemberService;
