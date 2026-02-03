import CommentModel from "../schema/Comment.model";
import AgencyModel from "../schema/members/Agency.model";
import AgentModel from "../schema/members/Agent.model";
import UserModel from "../schema/members/User.model";
import PropertyModel from "../schema/Property.model";
import Errors, { Message } from "../libs/Errors";
import { HttpCode } from "../libs/Errors";
import bcrypt from "bcrypt";
import { LoginInput, User, UserMemberInput } from "../libs/types/user";
import { MemberStatus, MemberType } from "../libs/enums/member.enum";
import { TarrifInputType } from "../libs/types/payment";
import TarrifModel, { Tarrif } from "../schema/Tarrif.model";
import TarrifService from "./Tarrif.service";
import { TarrifStatus } from "../libs/enums/payment.enum";
import { T } from "../libs/types/common";

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
    this.tarrifService = new TarrifService();
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
