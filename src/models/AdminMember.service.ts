import CommentModel from "../schema/Comment.model";
import AgencyModel from "../schema/members/Agency.model";
import AgentModel from "../schema/members/Agent.model";
import UserModel from "../schema/members/User.model";
import PropertyModel from "../schema/Property.model";
import Errors, { Message } from "../libs/Errors";
import { HttpCode } from "../libs/Errors";
import { MemberStatus, MemberType } from "../libs/enums/member.enum";
import TarrifModel, { Tariff } from "../schema/Tariff.model";
import { User, UserInputUpdate, UserMemberInput } from "../libs/types/user";
import TariffService from "./Tariff.service";
import {
  AdminGetAgencyType,
  AdminGetAgentType,
  AdminGetUserType,
  AdminMembers,
  CommonUsers,
  T,
} from "../libs/types/common";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { AdminAddTariffInput, TariffInputType } from "../libs/types/payment";
import {
  AdminGetAllMembersCategory,
  AdminGetAllMembersType,
} from "../libs/types/admin";
import { Model } from "mongoose";
import { OrderRender } from "../libs/enums/common.enum";

class AdminService {
  private readonly agentModel;
  private readonly agencyModel;
  private readonly userModel;
  private readonly propertyModel;
  private readonly commentProperty;
  public readonly tarrifService;
  private readonly tarrifModel;

  constructor() {
    this.agentModel = AgentModel;
    this.agencyModel = AgencyModel;
    this.userModel = UserModel;
    this.propertyModel = PropertyModel;
    this.commentProperty = CommentModel;
    this.tarrifService = new TariffService();
    this.tarrifModel = TarrifModel;
  }

  /////////////////////////// -- ADMIN SINGUP  -- //////////////////////////////
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

  ////////////////////////// ADMIN GET ALL MEMBERS /////////////////////////////
  public async adminGetAllMembers(
    queries: AdminGetAllMembersType,
  ): Promise<AdminMembers> {
    const { limit, page, memberCategory, sort: memberSort, status } = queries;

    // Figure out Model
    const modelMatch: T = {};
    const Models: Record<string, any> = {
      USER: this.userModel,
      AGENT: this.agentModel,
      AGENCY: this.agencyModel,
    };
    if (memberCategory) {
      if (memberCategory?.memberType) {
        modelMatch.role = memberCategory.memberType;
      }
    }

    const currentModel = Models[modelMatch.role];
    if (!currentModel) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_MEMBER_ROLE);
    }

    // Member Match
    const memberMatch: T = { memberStatus: MemberStatus.ACTIVE };

    if (status) {
      memberMatch.memberStatus = status;
    }

    // Sort
    const sort: T = {
      createdAt: -1,
    };

    if (memberSort) {
      sort.createdAt = memberSort === OrderRender.DESC ? -1 : 1;
    }

    // Create project
    const project = this.updateProject(memberCategory!);

    // Sort username
    const usernameMatch: T = {};

    if (memberCategory?.username) {
      usernameMatch.name = {
        $regex: memberCategory.username,
        $options: "i",
      };
    }

    // Search
    const [result] = await currentModel.aggregate([
      {
        $match: memberMatch,
      },
      {
        $sort: sort,
      },
      ...(Object.keys(project).length ? [{ $project: project }] : []),
      ...(memberCategory?.username ? [{ $match: usernameMatch }] : []),
      {
        $facet: {
          members: [
            {
              $skip: (page - 1) * limit,
            },
            {
              $limit: limit,
            },
          ],
          metaCounter: [{ $count: "total" }],
        },
      },
    ]);

    // Check
    if (!result.members.length) {
      return {
        members: result.members ?? [],
        metaCounter: result.metaCounter ?? [{ total: 0 }],
      };
    }

    // Return
    return result;
  }

  //////////////////////////////////// Helper functions /////////////////////////

  public updateProject(memberCategory: AdminGetAllMembersCategory): T {
    if (memberCategory?.memberType === MemberType.USER) {
      return {
        id: "$_id",
        name: "$memberName",
        type: "$role",
        systemStatus: "$memberStatus",
        phone: "$memberPhone",
        date: "$createdAt",
        _id: 0,
      };
    }

    if (memberCategory?.memberType === MemberType.AGENT) {
      return {
        id: "$_id",
        name: "$nickname",
        type: "$role",
        systemStatus: "$memberStatus",
        phone: 1,
        date: "$createdAt",
        verified: "$isVerified",
        averageRating: 1,
        businessStatus: "$currentStatus",
        licenseNumber: 1,
        _id: 0,
      };
    }
    if (memberCategory?.memberType === MemberType.AGENCY) {
      return {
        id: "$_id",
        name: "$memberName",
        type: "$role",
        systemStatus: "$memberStatus",
        phone: "$memberPhone",
        date: "$memberSince",
        verified: "$isVerified",
        businessStatus: "$currentStatus",
        licenseNumber: 1,
        _id: 0,
        registrationNumber: 1,
      };
    }
    return {};
  }
}

export default AdminService;
