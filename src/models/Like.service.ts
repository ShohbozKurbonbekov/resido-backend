import { T } from "../libs/types/common";
import { LikeInput, MeLiked } from "../libs/types/like";
import LikeModel from "../schema/Like.model";
import Errors, { HttpCode, Message } from "../libs/Errors";

class LikeService {
  private readonly likeModel;

  constructor() {
    this.likeModel = LikeModel;
  }

  public async toggleLike(input: LikeInput): Promise<number> {
    const search: T = {
      userId: input.userId,
      targetId: input.targetId,
    };

    const exist = await this.likeModel.findOne(search).lean().exec();

    let modifier = 1;

    if (exist) {
      await this.likeModel.findOneAndDelete(search).exec();
      modifier = -1;
    } else {
      try {
        await this.likeModel.create(input);
      } catch (error) {
        console.log("Error in LikeService");
        throw new Errors(HttpCode.BAD_REQUEST, Message.CREATING_FAILED);
      }
    }

    return modifier;
  }

  public async checkLikeExistance(input: LikeInput): Promise<MeLiked[]> {
    const { userId, targetId } = input;

    const result = await this.likeModel
      .findOne({ userId, targetId })
      .lean()
      .exec();

    return result
      ? [{ userId: result.userId, targetId: result.targetId, myFavorite: true }]
      : [];
  }
}

export default LikeService;
