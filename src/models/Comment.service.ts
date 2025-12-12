import { CommentInput, Comments, ItemComments } from "../libs/types/comment";
import CommentModel, { CommentDocs } from "../schema/Comment.model";
import Errors, { Message } from "../libs/Errors";
import { HttpCode } from "../libs/Errors";
import { CommentStatus, CommentTargetType } from "../libs/enums/comment.enum";
import AgentModel from "../schema/members/Agent.model";
import PropertyModel from "../schema/Property.model";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { CommonPageInput, T } from "../libs/types/common";
import BlogModel from "../schema/Blog.model";
import { Model, ObjectId } from "mongoose";

class CommentService {
  public readonly commentModel;
  public readonly agentModel;
  public readonly propertyModel;
  public readonly blogModel;

  constructor() {
    this.commentModel = CommentModel;
    this.agentModel = AgentModel;
    this.propertyModel = PropertyModel;
    this.blogModel = BlogModel;
  }

  ///////////////////////// CREATE A COMMENT /////////////
  public async createComment(
    input: CommentInput,
    member: T
  ): Promise<CommentDocs> {
    try {
      const Models: Record<string, any> = {
        agent: this.agentModel,
        blog: this.blogModel,
        property: this.propertyModel,
      };

      const CurrentModel = Models[input.targetType];

      if (!CurrentModel) {
        throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
      }

      const id = shapeIntoMongooseObjectId(input.targetId);
      const target = await CurrentModel.findById(id);

      if (!target) {
        throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
      }

      input.userId = member?._id;
      input.userInfo = {
        name: member?.memberName ?? member?.userFullname,
        avatar: member?.avatar,
        email: member?.memberEmail,
        phone: member?.memberPhone,
        userAddress: member?.memberAddress ?? "No address",
        userDescription: member?.memberDescription ?? "No description",
        occupation: member?.occupation,
      };

      const result = await this.commentModel.create(input);
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
    input: ItemComments
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
    query: CommonPageInput
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
}
export default CommentService;
