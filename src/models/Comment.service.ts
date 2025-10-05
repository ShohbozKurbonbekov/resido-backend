import { ObjectId } from "mongoose";
import { CommentInput } from "../libs/types/comment";
import CommentModel, { CommentDocs } from "../schema/Comment.model";
import Errors, { Message } from "../libs/Errors";
import { HttpCode } from "../libs/Errors";
import { CommentTargetType } from "../libs/enums/comment.enum";
import AgentModel from "../schema/members/Agent.model";
import PropertyModel from "../schema/Property.model";
import { shapeIntoMongooseObjectId } from "../libs/config";

class CommentService {
  private readonly commentModel;
  private readonly agentModel;
  private readonly propertyModel;
  constructor() {
    this.commentModel = CommentModel;
    this.agentModel = AgentModel;
    this.propertyModel = PropertyModel;
  }

  public async createComment(
    input: CommentInput,
    member: any
  ): Promise<CommentDocs> {
    console.log(member);
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
        name: member.memberName,
        avatar: member.avatar ?? "example.jpg",
        email: member.memberEmail,
        phone: member.memberPhone,
        userAddress: member.userAddress,
        userDescription: member.userDescription,
      };

      const result = await this.commentModel.create(input);

      return result;
    } catch (error) {
      console.log("Error in  createComment service: ", error);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATING_FAILED);
    }
  }
}
export default CommentService;
