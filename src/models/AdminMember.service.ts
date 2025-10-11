import CommentModel from "../schema/Comment.model";
import AgencyModel from "../schema/members/Agency.model";
import AgentModel from "../schema/members/Agent.model";
import UserModel from "../schema/members/User.model";
import PropertyModel from "../schema/Property.model";
import Errors, { Message } from "../libs/Errors";
import { HttpCode } from "../libs/Errors";
import { User, UserMemberInput } from "../libs/types/user";
import { MemberType } from "../libs/enums/member.enum";

class AdminService {
  private readonly agentModel;
  private readonly agencyModel;
  private readonly userModel;
  private readonly propertyModel;
  private readonly commentProperty;

  //FOR BLOG
  // private readonly blogModel
  constructor() {
    this.agentModel = AgentModel;
    this.agencyModel = AgencyModel;
    this.userModel = UserModel;
    this.propertyModel = PropertyModel;
    this.commentProperty = CommentModel;
  }

  public async processSignup(input: UserMemberInput): Promise<User> {
    const exist = await this.userModel
      .findOne({
        memberType: MemberType.REAL_ESTATE_ADMIN,
      })
      .lean()
      .exec();

    if (exist) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATING_FAILED);
    }
    try {
      const result = await this.userModel.create(input);
      return result;
    } catch (error) {
      console.log("Error in process admin signup: ", error);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATING_FAILED);
    }
  }
}

export default AdminService;
