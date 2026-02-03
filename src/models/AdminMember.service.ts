import CommentModel from "../schema/Comment.model";
import AgencyModel from "../schema/members/Agency.model";
import AgentModel from "../schema/members/Agent.model";
import UserModel from "../schema/members/User.model";
import PropertyModel from "../schema/Property.model";
import Errors, { Message } from "../libs/Errors";
import { HttpCode } from "../libs/Errors";
import { MemberStatus, MemberType } from "../libs/enums/member.enum";
import TarrifModel, { Tariff } from "../schema/Tariff.model";
import { User, UserMemberInput } from "../libs/types/user";
import TariffService from "./Tariff.service";

class AdminService {
  private readonly agentModel;
  private readonly agencyModel;
  private readonly userModel;
  private readonly propertyModel;
  private readonly commentProperty;
  public readonly tarrifService;
  private readonly tarrifModel;

  //FOR BLOG
  // private readonly blogModel
  constructor() {
    this.agentModel = AgentModel;
    this.agencyModel = AgencyModel;
    this.userModel = UserModel;
    this.propertyModel = PropertyModel;
    this.commentProperty = CommentModel;
    this.tarrifService = new TariffService();
    this.tarrifModel = TarrifModel;
  }

  public async processSignup(input: UserMemberInput): Promise<User> {
    const exist = await this.userModel
      .findOne({
        role: MemberType.REAL_ESTATE_ADMIN,
        memberStatus: MemberStatus.ACTIVE,
      })
      .lean()
      .exec();

    if (exist) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.ADMIN_EXISTS);
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
