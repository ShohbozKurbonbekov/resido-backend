import {
  CommentInput,
  Comments,
  CommentUpdate,
  ItemComments,
} from "../libs/types/comment";
import CommentModel, { CommentDocs } from "../schema/Comment.model";
import Errors, { Message } from "../libs/Errors";
import { HttpCode } from "../libs/Errors";
import { CommentStatus, CommentTargetType } from "../libs/enums/comment.enum";
import AgentModel from "../schema/members/Agent.model";
import PropertyModel, { Property } from "../schema/Property.model";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { CommonPageInput, StatusChangeType, T } from "../libs/types/common";
import BlogModel, { BlogDoc } from "../schema/Blog.model";
import { Model, ObjectId } from "mongoose";
import MemberService from "./Member.service";
import { Agent } from "../libs/types/agent";
import { MemberStatus, MemberType } from "../libs/enums/member.enum";
import UserModel from "../schema/members/User.model";

class CommentService {
  public readonly commentModel;
  public readonly agentModel;
  public readonly propertyModel;
  public readonly blogModel;
  public readonly memberService;
  private readonly userModel;

  constructor() {
    this.commentModel = CommentModel;
    this.agentModel = AgentModel;
    this.propertyModel = PropertyModel;
    this.blogModel = BlogModel;
    this.memberService = new MemberService();
    this.userModel = UserModel;
  }

  ///////////////////////// CREATE A COMMENT /////////////
  public async createComment(
    input: CommentInput,
    member: T,
  ): Promise<CommentDocs> {
    try {
      const Models: Record<string, any> = {
        agent: this.agentModel,
        blog: this.blogModel,
        property: this.propertyModel,
      };

      const CurrentModel = Models[input.targetType];

      if (!CurrentModel) {
        throw new Errors(HttpCode.UNAUTHORIZED, Message.INVALID_ROLE);
      }

      const id = shapeIntoMongooseObjectId(input.targetId);
      const target = await CurrentModel.findById(id);

      if (!target) {
        throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
      }

      const receiverData = this.findReceiver(input.targetType, target);

      const result = await this.commentModel.create({
        ...input,
        receiverData,
        userId: shapeIntoMongooseObjectId(member._id),
      });
      return result;
    } catch (error) {
      console.log("Error in createComment service: ", error);

      if (error instanceof Errors) {
        throw error;
      }

      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATING_FAILED);
    }
  }

  ///////////////////////// GET LATEST COMMENTS /////////////
  public async getLatestComments(): Promise<CommentDocs[]> {
    const result = await this.commentModel
      .find({
        status: CommentStatus.ACTIVE,
      })
      .sort({
        createdAt: -1,
      })
      .limit(10)
      .exec();
    if (!result.length) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }
    return result;
  }

  //////////////////////// GET ITEM COMMENTS ////////////////
  public async getComments(
    itemId: ObjectId,
    input: ItemComments,
  ): Promise<Comments> {
    const { page, limit, commentTarget } = input;
    const match: T = { status: CommentStatus.ACTIVE, targetId: itemId };
    const sort: T = {
      createdAt: -1,
    };
    const Models: T = {
      blog: this.blogModel,
      property: this.propertyModel,
      agent: this.agentModel,
    };

    const Model = Models[commentTarget];

    if (!Model) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.NO_COMMENT_TYPE);
    }

    const item = await Model.findById(itemId);

    if (!item) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }

    const [result] = await this.commentModel.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "users",
          let: {
            authorId: "$userId",
          },
          as: "authorData",
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$authorId"],
                },
              },
            },
            {
              $project: {
                avatar: 1,
                memberPhone: 1,
                memberAddress: 1,
                occupation: 1,
                memberEmail: 1,
                memberName: 1,
              },
            },
          ],
        },
      },
      { $unwind: "$authorData" },
      {
        $facet: {
          comments: [{ $sort: sort }, { $limit: limit * page }],
          metaCounter: [{ $count: "total" }],
        },
      },
    ]);

    if (!result.comments.length) {
      return {
        comments: [],
        metaCounter: [{ total: 0 }],
      };
    }
    return result;
  }

  /////////////////////// GET USER COMMENTS /////////////////////
  public async getUserComments(
    userId: ObjectId,
    query: CommonPageInput,
  ): Promise<Comments> {
    const { page, limit } = query;

    const match: T = {
      userId,
      status: CommentStatus.ACTIVE,
    };

    const sort: T = {
      createdAt: -1,
    };

    const [result] = await this.commentModel.aggregate([
      {
        $match: match,
      },
      {
        $sort: sort,
      },
      {
        $facet: {
          comments: [
            {
              $skip: (page - 1) * limit,
            },
            {
              $limit: limit,
            },
            {
              $project: {
                userInfo: 0,
              },
            },
          ],
          metaCounter: [{ $count: "total" }],
        },
      },
    ]);
    if (!result.comments.length) {
      return {
        comments: [],
        metaCounter: [{ total: 0 }],
      };
    }
    return result;
  }

  /////////////////////// UPDATE USER COMMENTS /////////////////////
  public async updateUserComments(
    query: T,
    input: CommentUpdate,
  ): Promise<CommentDocs> {
    const match: T = {
      ...query,
      status: CommentStatus.ACTIVE,
    };

    const updateInput = {
      ...(input.content && { content: input.content.trim() }),
      ...(typeof input.rating === "number" && { rating: input.rating }),
    };

    const result = await this.commentModel.findOneAndUpdate(
      match,
      updateInput,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!result) {
      throw new Errors(HttpCode.NOT_MODIFIELD, Message.UPDATING_FAILED);
    }
    return result;
  }

  /////////////////////// DELETE USER COMMENTS /////////////////////
  public async deleteUserComments(query: T): Promise<CommentDocs> {
    const match: T = {
      ...query,
      status: CommentStatus.ACTIVE,
    };

    const result = await this.commentModel.findOneAndUpdate(
      match,
      {
        status: CommentStatus.DELETE,
      },
      { new: true },
    );

    if (!result) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.DELETING_FAILED);
    }
    return result;
  }

  /////////////////////// GET COMMENTS FOR ADMIN  /////////////////////
  public async getCommentsForAdmin(
    adminId: ObjectId,
    queries: CommonPageInput & { status?: CommentStatus; username?: string },
  ): Promise<Comments> {
    // Check admin
    const adminMatch: T = {
      _id: adminId,
      memberStatus: MemberStatus.ACTIVE,
      role: MemberType.REAL_ESTATE_ADMIN,
    };

    const admin = await this.userModel.findOne(adminMatch).lean().exec();

    if (!admin) {
      throw new Errors(HttpCode.FORBIDDEN, Message.ACCESS_DENIED);
    }

    // Destructure
    const { limit, page, status, username } = queries;

    // Check status of Comment
    const allowedCommentStatus = [
      CommentStatus.ACTIVE,
      CommentStatus.ARCHIVED,
      CommentStatus.DELETE,
    ];

    if (status && !allowedCommentStatus.includes(status)) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_COMMENT_STATUS);
    }

    // Match queries;
    const usernameValid = username && typeof username === "string";

    const nameMatch: T = {};

    if (usernameValid) {
      nameMatch["senderData.memberName"] = {
        $regex: username,
        $options: "i",
      };
    }

    const pipeline: any[] = [
      {
        $match: { status },
      },
      {
        $lookup: {
          from: "users",
          let: {
            userId: "$userId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$userId"],
                },
              },
            },
            {
              $project: {
                memberName: 1,
                _id: 1,
              },
            },
          ],
          as: "senderData",
        },
      },
      {
        $unwind: { path: "$senderData", preserveNullAndEmptyArrays: true },
      },
      ...(usernameValid ? [{ $match: nameMatch }] : []),
      {
        $project: {
          receiverData: 0,
        },
      },

      {
        $sort: { createdAt: -1 },
      },
      {
        $project: {
          id: "$_id",
          content: 1,
          status: 1,
          date: "$createdAt",
          author: "$senderData.memberName",
          _id: 0,
        },
      },
      {
        $facet: {
          comments: [{ $skip: (page - 1) * limit }, { $limit: limit }],
          metaCounter: [{ $count: "total" }],
        },
      },
    ];
    const [result] = await this.commentModel.aggregate(pipeline);

    if (!result.comments.length) {
      return { comments: [], metaCounter: [{ total: 0 }] };
    }
    return result;
  }

  /////////////////////// ADMIN CHANGE COMMENT STATUS ///////////////////

  public async adminChangeCommentStatus(
    adminId: ObjectId,
    queries: StatusChangeType<CommentStatus>,
  ): Promise<CommentDocs> {
    const { id, status } = queries;
    // Check status Valid
    const allowedCommentStatus = [
      CommentStatus.ACTIVE,
      CommentStatus.ARCHIVED,
      CommentStatus.DELETE,
    ];

    if (!allowedCommentStatus.includes(status)) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_COMMENT_STATUS);
    }
    // Check admin
    const adminMatch: T = {
      _id: adminId,
      memberStatus: MemberStatus.ACTIVE,
      role: MemberType.REAL_ESTATE_ADMIN,
    };

    const admin = await this.userModel.findOne(adminMatch).lean().exec();

    if (!admin) {
      throw new Errors(HttpCode.FORBIDDEN, Message.ACCESS_DENIED);
    }

    // Find comment and Change status
    const result = await this.commentModel.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          status,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    // Return updated one
    if (!result) {
      throw new Errors(HttpCode.NOT_MODIFIELD, Message.UPDATING_FAILED);
    }

    return result;
  }
  /////////////////////////// -- HELPER FUNCTIONS -- ////////////////////

  private findReceiver(
    role: CommentTargetType,
    targatData: Agent | BlogDoc | Property,
  ) {
    if (role === CommentTargetType.BLOG) {
      const data = targatData as BlogDoc;
      return {
        targetName: data?.blogTitle,
        targetImage: data?.blogImage,
      };
    }
    if (role === CommentTargetType.PROPERTY) {
      const data = targatData as Property;
      return {
        targetName: data?.title,
        targetImage: data?.images?.[0],
      };
    }

    const data = targatData as Agent;
    return {
      targetName: data?.fullName,
      targetImage: data?.avatar,
    };
  }
}
export default CommentService;
