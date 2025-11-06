import { CommentInput } from "../libs/types/comment";
import CommentModel, { CommentDocs } from "../schema/Comment.model";
import Errors, { Message } from "../libs/Errors";
import { HttpCode } from "../libs/Errors";
import { CommentStatus, CommentTargetType } from "../libs/enums/comment.enum";
import AgentModel from "../schema/members/Agent.model";
import PropertyModel from "../schema/Property.model";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { T } from "../libs/types/common";
import BlogModel from "../schema/Blog.model";
import { Model } from "mongoose";

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
}
export default CommentService;
