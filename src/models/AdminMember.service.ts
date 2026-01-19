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
import { TarrifInputType } from "../libs/types/payment";
import { Tarrif } from "../schema/Tarrif.model";
import TarrifService from "./Tarrif.service";

class AdminService {
  private readonly agentModel;
  private readonly agencyModel;
  private readonly userModel;
  private readonly propertyModel;
  private readonly commentProperty;
  public readonly tarrifService;

  //FOR BLOG
  // private readonly blogModel
  constructor() {
    this.agentModel = AgentModel;
    this.agencyModel = AgencyModel;
    this.userModel = UserModel;
    this.propertyModel = PropertyModel;
    this.commentProperty = CommentModel;
    this.tarrifService = new TarrifService();
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
      },
    );

    if (!member) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER);
    }

    const isMatch: boolean = await bcrypt.compare(
      input.memberPassword,
      member.memberPassword,
    );

    if (!isMatch) {
      throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
    }
    return (await this.userModel.findById(member._id).exec()) as User;
  }

  //////////////////////// INSERT TARRIF ///////////////////
  public async addTarrif(input: TarrifInputType): Promise<Tarrif> {
    const { agents, properties } = input.limits;
    const agentsNum = Number(agents);
    const propertiesNum = Number(properties);

    const entityInput: TarrifInputType = {
      billingCycle: input.billingCycle,
      currency: input.currency,
      features: input.features.map((feature) => feature.trim()),
      limits: {
        agents: Number.isFinite(agentsNum) ? agentsNum : 0,
        properties: Number.isFinite(propertiesNum) ? propertiesNum : 0,
      },
      name: input.name,
      price: Number.isFinite(Number(input.price)) ? Number(input.price) : 0,
    };

    const result = await this.tarrifService.adminInsertTarrif(entityInput);
    return result;
  }
}

export default AdminService;
