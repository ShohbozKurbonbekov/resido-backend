import CommentModel from "../schema/Comment.model";
import AgencyModel from "../schema/members/Agency.model";
import AgentModel from "../schema/members/Agent.model";
import UserModel from "../schema/members/User.model";
import PropertyModel from "../schema/Property.model";
import Errors, { Message } from "../libs/Errors";
import { HttpCode } from "../libs/Errors";
import bcrypt from "bcrypt";
import { LoginInput, User, UserMemberInput } from "../libs/types/user";
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

  public async processLogin(input: LoginInput): Promise<User> {
    const member = await this.userModel.findOne(
      {
        memberEmail: input.memberEmail,
      },
      {
        memberName: 1,
        memberPassword: 1,
      }
    );

    if (!member) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER);
    }

    const isMatch: boolean = await bcrypt.compare(
      input.memberPassword,
      member.memberPassword
    );

    if (!isMatch) {
      throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
    }
    return (await this.userModel.findById(member._id).exec()) as User;
  }
}

export default AdminService;
