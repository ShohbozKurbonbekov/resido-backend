import { CommentInput } from "../libs/types/comment";
import CommentModel, { CommentDocs } from "../schema/Comment.model";
import Errors, { Message } from "../libs/Errors";
import { HttpCode } from "../libs/Errors";
import { CommentStatus, CommentTargetType } from "../libs/enums/comment.enum";
import AgentModel from "../schema/members/Agent.model";
import PropertyModel from "../schema/Property.model";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { T } from "../libs/types/common";

class CommentService {
  private readonly commentModel;
  private readonly agentModel;
  private readonly propertyModel;
  constructor() {
    this.commentModel = CommentModel;
    this.agentModel = AgentModel;
    this.propertyModel = PropertyModel;
  }

  ///////////////////////// CREATE A COMMENT /////////////
  public async createComment(
    input: CommentInput,
    member: T
  ): Promise<CommentDocs> {
    try {
      const id = shapeIntoMongooseObjectId(input.targetId);
      if (input.targetType === CommentTargetType.AGENT) {
        const agent = await this.agentModel.findById(id);
        if (!agent) {
          throw new Error();
        }
      } else if (input.targetType === CommentTargetType.PROPERTY) {
        const property = await this.propertyModel.findById(id);
        if (!property) {
          throw new Error();
        } else {
          // Check from the blog collection
        }
      }

      input.userId = shapeIntoMongooseObjectId(member._id);
      input.userInfo = {
        name: member.memberName ?? member.fullName ?? member.nickname,
        avatar: member.avatar ?? "no avatar",
        email: member.memberEmail,
        phone: member.memberPhone,
        userAddress: member.userAddress,
        userDescription: member.userDescription,
        occupation: member.occupation ?? "none",
      };

      const result = await this.commentModel.create(input);

      return result;
    } catch (error) {
      console.log("Error in  createComment service: ", error);
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
