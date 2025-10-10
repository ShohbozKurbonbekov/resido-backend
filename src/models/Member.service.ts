import mongoose, { ObjectId } from "mongoose";
import Errors, { Message } from "../libs/Errors";
import {
  UserMemberInput,
  User,
  LoginInput,
  UserInputUpdate,
} from "../libs/types/user";
import UserModel from "../schema/members/User.model";
import { HttpCode } from "../libs/Errors";
import AgencyModel from "../schema/members/Agency.model";

import {
  Agency,
  AgencyInputUpdate,
  AgencyMemberInput,
} from "../libs/types/agency";
import {
  AgentInputUpdate,
  FeaturedAgentsInput,
  FeaturedAgentsResult,
  MemberAgentInput,
} from "../libs/types/agent";
import { Agent } from "../libs/types/agent";
import AgentModel from "../schema/members/Agent.model";
import { MemberStatus, MemberType } from "../libs/enums/member.enum";
import bcrypt from "bcrypt";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { AgentStatus } from "../libs/enums/agent.enum";
import MessageModel, { MessageDoc } from "../schema/Message.model";
import { MessageInput } from "../libs/types/message";

class MemberService {
  private readonly userModel;
  private readonly agencyModel;
  private readonly agentModel;
  private readonly messageModel;

  constructor() {
    this.userModel = UserModel;
    this.agencyModel = AgencyModel;
    this.agentModel = AgentModel;
    this.messageModel = MessageModel;
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
      throw new Errors(
        HttpCode.BAD_REQUEST,
        Message.USED_USERNAME_PHONE_PASSWORD
      );
    }
  }

  public async login(input: LoginInput): Promise<User | Agency | Agent> {
    let member: null | Agency | Agent | User = null;
    const memberUser: null | User = await this.userModel.findOne(
      {
        memberEmail: input.memberEmail,
        memberStatus: { $ne: MemberStatus.DELETED },
      },
      {
        memberPassword: 1,
        memberStatus: 1,
        _id: 1,
      }
    );
    const memberAgent: null | Agent = await this.agentModel.findOne(
      {
        memberEmail: input.memberEmail,
        memberStatus: { $ne: MemberStatus.DELETED },
      },
      {
        memberPassword: 1,
        memberStatus: 1,
        _id: 1,
      }
    );
    const memberAgency: null | Agency = await this.agencyModel
      .findOne(
        {
          memberEmail: input.memberEmail,
          memberStatus: { $ne: MemberStatus.DELETED },
        },
        {
          memberPassword: 1,
          memberStatus: 1,
          _id: 1,
        }
      )
      .exec();

    if (memberUser) member = memberUser;
    if (memberAgency) member = memberAgency;
    if (memberAgent) member = memberAgent;

    if (!member) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER);
    } else if (member.memberStatus === MemberStatus.BLOCKED) {
      throw new Errors(HttpCode.FORBIDDEN, Message.BLOCKED_USER);
    }
    const isMatch: boolean = await bcrypt.compare(
      input.memberPassword,
      member.memberPassword
    );

    if (!isMatch) {
      throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
    }

    let result: User | Agent | Agency | null = null;

    const resultUser: null | User = await this.userModel
      .findById(member?._id)
      .lean()
      .exec();
    const resultAgent: null | Agent = await this.agentModel
      .findById(member?._id)
      .lean()
      .exec();
    const resultAgency: null | Agency = await this.agencyModel
      .findById(member?._id)
      .lean()
      .exec();

    if (resultUser) {
      result = resultUser;
    } else if (resultAgent) {
      result = resultAgent;
    } else if (resultAgency) {
      result = resultAgency;
    }

    if (!result) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER);
    }
    return result;
  }

  public async getMemberDetail(
    member: Agency | Agent | User
  ): Promise<Agency | Agent | User> {
    const memberId = shapeIntoMongooseObjectId(member._id);
    let result;

    switch (member.role) {
      case "USER":
        result = await this.userModel
          .findOne({
            _id: memberId,
            memberStatus: MemberStatus.ACTIVE,
          })
          .lean()
          .exec();
        break;
      case "AGENT":
        result = await this.agentModel
          .findOne({
            _id: memberId,
            memberStatus: MemberStatus.ACTIVE,
          })
          .lean()
          .exec();
        break;
      case "AGENCY":
        result = await this.agencyModel
          .findOne({
            _id: memberId,
            memberStatus: MemberStatus.ACTIVE,
          })
          .lean()
          .exec();
        break;
      default:
        throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_ROLE);
    }

    if (!result) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }
    return result;
  }

  // WRITE A MESSAGE TO USER
  public async WriteMessageToMember(
    userId: ObjectId,
    input: MessageInput
  ): Promise<MessageDoc> {
    let receiver;
    try {
      switch (input.receiverType) {
        case "USER":
          receiver = await this.userModel.findOne({
            _id: input.receiverId,
            memberStatus: MemberStatus.ACTIVE,
          });
          break;
        case "AGENT":
          receiver = await this.agentModel.findOne({
            _id: input.receiverId,
            memberStatus: MemberStatus.ACTIVE,
          });
          break;
        case "AGENCY":
          receiver = await this.agencyModel.findOne({
            _id: input.receiverId,
            memberStatus: MemberStatus.ACTIVE,
          });
          break;
        case "REAL_ESTATE_ADMIN":
          receiver = await this.userModel.findOne({
            role: MemberType.REAL_ESTATE_ADMIN,
            memberStatus: MemberStatus.ACTIVE,
          });
          break;
        default:
          throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
      }

      if (!receiver) {
        throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
      }

      if (!input.senderId) {
        input = {
          ...input,
          senderId: userId,
        };
      }

      const result = await this.messageModel.create(input);

      return result;
    } catch (error) {
      console.log("Error in WriteMessageToMember service: ", error);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATING_FAILED);
    }
  }

  /// UPDATE A MEMBER
  public async updateMember(
    member: User | Agency | Agent,
    input: UserInputUpdate | AgencyInputUpdate | AgentInputUpdate
  ): Promise<User | Agent | Agency> {
    const memberId = shapeIntoMongooseObjectId(member._id);
    let result;

    switch (member.role) {
      case "AGENT":
        result = await this.agentModel
          .findByIdAndUpdate({ _id: memberId }, input, { new: true })
          .lean()
          .exec();
        break;
      case "AGENCY":
        result = await this.agencyModel
          .findByIdAndUpdate({ _id: memberId }, input, { new: true })
          .lean()
          .exec();
        break;
      case "USER":
        result = await this.userModel
          .findByIdAndUpdate({ _id: memberId }, input, { new: true })
          .lean()
          .exec();
        break;
      default:
        throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_ROLE);
    }

    if (!result) {
      throw new Errors(HttpCode.NOT_MODIFIELD, Message.UPDATING_FAILED);
    }
    return result;
  }

  // GET FEATURED AGENTS
  public async getFeaturedAgents(
    input: FeaturedAgentsInput
  ): Promise<FeaturedAgentsResult> {
    const [properties, totalPropertiesNumber] = await Promise.all([
      this.agentModel
        .find({
          currentStatus: AgentStatus.AVAILABLE,
          memberStatus: MemberStatus.ACTIVE,
          featuredScore: { $gte: 0.8 },
        })
        .sort({
          featuredScore: -1,
        })
        .skip((input.page - 1) * input.limit)
        .limit(input.limit)
        .lean()
        .exec(),
      this.agentModel
        .countDocuments({
          memberStatus: MemberStatus.ACTIVE,
          currentStatus: AgentStatus.AVAILABLE,
          featuredScore: {
            $gte: 0.8,
          },
        })
        .exec(),
    ]);
    if (!properties.length) {
    }
    return { properties, totalPropertiesNumber };
  }
}

export default MemberService;
