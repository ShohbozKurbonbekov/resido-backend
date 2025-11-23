import mongoose, { model, ObjectId } from "mongoose";
import Errors, { Message } from "../libs/Errors";
import {
  UserMemberInput,
  User,
  LoginInput,
  UserInputUpdate,
} from "../libs/types/user";
import UserModel from "../schema/members/User.model";
import { HttpCode } from "../libs/Errors";
import AgencyModel, { Agency } from "../schema/members/Agency.model";

import { AgencyInputUpdate, AgencyMemberInput } from "../libs/types/agency";
import {
  AgentInputUpdate,
  FeaturedAgentsInput,
  AgentResults,
  MemberAgentInput,
  FeaturedAgentsResult,
} from "../libs/types/agent";
import { Agent } from "../libs/types/agent";
import AgentModel from "../schema/members/Agent.model";
import { MemberStatus, MemberType } from "../libs/enums/member.enum";
import bcrypt from "bcrypt";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { AgentStatus } from "../libs/enums/agent.enum";
import MessageModel, { MessageDoc } from "../schema/Message.model";
import { MessageInput } from "../libs/types/message";
import { PropertyType } from "../libs/enums/property.enum";
import { CommonUsers, CommonUsersUpdateInput, T } from "../libs/types/common";

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
  ): Promise<CommonUsers> {
    try {
      let result;
      if (
        input.role === MemberType.USER ||
        input.role === MemberType.REAL_ESTATE_ADMIN
      ) {
        result = await this.userModel.create(input);
      } else if (input.role === MemberType.AGENCY) {
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

  public async getMemberDetail(member: CommonUsers): Promise<CommonUsers> {
    // style 1
    const memberId = shapeIntoMongooseObjectId(member._id);

    const Models: T = {
      USER: this.userModel,
      REAL_ESTATE_ADMIN: this.userModel,
      AGENT: this.agentModel,
      AGENCY: this.agencyModel,
    };

    const Model = Models[member.role];
    if (!Model) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_ROLE);
    }

    const query: T =
      member.role === MemberType.REAL_ESTATE_ADMIN
        ? {
            role: MemberType.REAL_ESTATE_ADMIN,
            memberStatus: MemberStatus.ACTIVE,
          }
        : { _id: member._id!, memberStatus: MemberStatus.ACTIVE };

    const result = await Model.findOne(query);
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
    const { receiverId, receiverType } = input;

    const receiverModel: T = {
      USER: this.userModel,
      AGENT: this.agentModel,
      AGENCY: this.agencyModel,
      REAL_ESTATE_ADMIN: this.userModel,
    };

    const Model = receiverModel[receiverType];

    if (!Model) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_ROLE);
    }

    const query =
      receiverType === (MemberType.REAL_ESTATE_ADMIN as string)
        ? {
            role: MemberType.REAL_ESTATE_ADMIN,
            memberStatus: MemberStatus.ACTIVE,
          }
        : { _id: receiverId, memberStatus: MemberStatus.ACTIVE };

    const receiver = await Model.findOne(query);

    if (!receiver) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_MESSAGE_TO_MEMBER);
    }

    try {
      const data: MessageInput = {
        ...input,
        senderId: input.senderId ?? userId,
      };

      const result = await this.messageModel.create(data);
      return result;
    } catch (error) {
      console.log("Error in WriteMessageToMember service: ", error);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATING_FAILED);
    }
  }

  /// UPDATE A MEMBER
  public async updateMember(
    member: CommonUsers,
    input: CommonUsersUpdateInput
  ): Promise<CommonUsers> {
    const memberId = shapeIntoMongooseObjectId(member._id);

    const Models: T = {
      USER: this.userModel,
      REAL_ESTATE_ADMIN: this.userModel,
      AGENT: this.agentModel,
      AGENCY: this.agencyModel,
    };

    const Model = Models[member.role];

    if (!Model) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_ROLE);
    }

    const query: T =
      member.role === MemberType.REAL_ESTATE_ADMIN
        ? {
            role: MemberType.REAL_ESTATE_ADMIN,
            memberStatus: MemberStatus.ACTIVE,
          }
        : { _id: member._id!, memberStatus: MemberStatus.ACTIVE };

    const result = await Model.findOneAndUpdate(query, input, { new: true });

    if (!result) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }
    return result;
  }
}

export default MemberService;
