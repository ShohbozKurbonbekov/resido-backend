import Errors, { Message } from "../libs/Errors";
import {
  UserMemberInput,
  User,
  AgencyMemberInput,
  Agency,
} from "../libs/types/member";
import UserModel from "../schema/members/User.model";
import { HttpCode } from "../libs/Errors";
import AgencyModel from "../schema/members/Agency.model";

class MemberService {
  private readonly userModel;
  private readonly agencyModel;
  constructor() {
    this.userModel = UserModel;
    this.agencyModel = AgencyModel;
  }

  public async signup(
    input: UserMemberInput | AgencyMemberInput
  ): Promise<User | Agency> {
    try {
      let result;
      if (input.role === "USER") {
        result = await this.userModel.create(input);
      } else {
        result = await this.agencyModel.create(input);
      }

      return result.toObject();
    } catch (error) {
      console.log("Error in userSignup service model");
      throw new Errors(HttpCode.BAD_REQUEST, Message.USED_USERNAME_PHONE);
    }
  }
}

export default MemberService;
