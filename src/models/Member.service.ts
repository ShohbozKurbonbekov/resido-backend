import Errors, { Message } from "../libs/Errors";
import { UserMemberInput, User } from "../libs/types/member";
import UserModel from "../schema/members/User.model";
import { HttpCode } from "../libs/Errors";
import AgencyModel from "../schema/members/Agency.model";
import { AgencyMemberInput } from "../libs/types/agency";
import { Agency } from "../libs/types/agency";
import { MemberAgentInput } from "../libs/types/agent";
import { Agent } from "../libs/types/agent";
import AgentModel from "../schema/members/Agent.model";

class MemberService {
  private readonly userModel;
  private readonly agencyModel;
  private readonly agentModel;
  constructor() {
    this.userModel = UserModel;
    this.agencyModel = AgencyModel;
    this.agentModel = AgentModel;
  }

  public async signup(
    input: UserMemberInput | AgencyMemberInput | MemberAgentInput
  ): Promise<User | Agency | Agent> {
    try {
      let result;
      if (input.role === "USER") {
        result = await this.userModel.create(input);
      } else if (input.role === "AGENCY") {
        result = await this.agencyModel.create(input);
      } else {
        result = await this.agentModel.create(input);
      }

      return result.toObject();
    } catch (error) {
      console.log("Error in userSignup service model", error);
      throw new Errors(HttpCode.BAD_REQUEST, Message.USED_USERNAME_PHONE);
    }
  }
}

export default MemberService;
