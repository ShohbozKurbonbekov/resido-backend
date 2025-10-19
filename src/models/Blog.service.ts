import { CommonUsers, StatisticsModifier, T } from "../libs/types/common";
import BlogModel, { BlogDoc } from "../schema/Blog.model";
import ViewService from "./View.service";
import { BlogInput, Blogs } from "../libs/types/blog";
import UserModel from "../schema/members/User.model";
import AgentModel from "../schema/members/Agent.model";
import AgencyModel from "../schema/members/Agency.model";
import { BlogAuthorType, BlogStatus } from "../libs/enums/blog.enum";
import { MemberStatus, MemberType } from "../libs/enums/member.enum";
import { HttpCode } from "../libs/Errors";
import Errors, { Message } from "../libs/Errors";
import {
  addTotCommentsAvRatingFields,
  commentLookup,
  shapeIntoMongooseObjectId,
} from "../libs/config";
import { User } from "../libs/types/user";
import { ObjectId } from "mongoose";
import { LikeInput } from "../libs/types/like";
import LikeService from "./Like.service";
import { LikeGroup } from "../libs/enums/like.enum";
import { View, ViewInput } from "../libs/types/view";
import { ViewGroup } from "../libs/enums/view.enum";

class BlogService {
  private readonly blogModel;
  public readonly viewService;
  public readonly userModel;
  public readonly agentModel;
  public readonly agencyModel;
  public readonly likeService;

  constructor() {
    this.userModel = UserModel;
    this.blogModel = BlogModel;
    this.viewService = new ViewService();
    this.agentModel = AgentModel;
    this.agencyModel = AgencyModel;
    this.likeService = new LikeService();
  }

  // POST BLOG
  public async postBlog(
    member: CommonUsers,
    input: BlogInput
  ): Promise<BlogDoc> {
    const Models: Record<string, any> = {
      REAL_ESTATE_ADMIN: this.userModel,
      AGENCY: this.agencyModel,
      AGENT: this.agentModel,
    };

    const match: T =
      member.role === MemberType.REAL_ESTATE_ADMIN
        ? { role: "REAL_ESTATE_ADMIN", memberStatus: MemberStatus.ACTIVE }
        : {
            _id: member._id,
            memberStatus: MemberStatus.ACTIVE,
          };

    const CurrentModel = Models[member.role];

    const blogger = await CurrentModel.findOne(match);

    if (!blogger) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }

    try {
      const result = await this.blogModel.create({
        ...input,
        blogAuthorId: member._id,
        blogAuthorType:
          member.role === MemberType.REAL_ESTATE_ADMIN
            ? "User"
            : String(member.role)[0].toUpperCase() +
              member.role.slice(1).toLowerCase(),
      });

      return result;
    } catch (error) {
      console.log("Error in postBlog: ", error);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATING_FAILED);
    }
  }

  // GET ALL BLOGS
  public async getAllBlogs(query: T): Promise<Blogs> {
    const match: T = {
      blogStatus: BlogStatus.ACTIVE,
    };

    if (query?.category) {
      match.blogCategory = query.category;
    }
    if (query?.title) {
      match.blogTitle = {
        $regex: query.title,
        $options: "i",
      };
    }

    const sort: T = {
      createdAt: query.sort === "DESC" ? -1 : 1,
    };

    const [result] = await this.blogModel.aggregate([
      {
        $match: match,
      },
      {
        $sort: sort,
      },
      {
        $facet: {
          blogs: [
            {
              $skip: (query.page - 1) * query.limit,
            },
            {
              $limit: query.limit,
            },
          ],
          totalBlogsNumber: [{ $count: "total" }],
        },
      },
    ]);

    if (!result.blogs.length) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }

    return result;
  }

  // LIKE A BLOG
  public async likeTargetBlog(
    member: CommonUsers,
    id: ObjectId
  ): Promise<BlogDoc> {
    // checking liking user's existance
    const target = await this.blogModel.findOne({
      _id: id,
      blogStatus: BlogStatus.ACTIVE,
    });

    if (!target) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }

    // figuring out whether user liked before or not
    const input: LikeInput = {
      likeGroup: LikeGroup.BLOG,
      targetId: id,
      userId: member?._id!,
    };

    const modifier = <number>await this.likeService.toggleLike(input);

    const result = await this.blogStatsEditor({
      _id: id,
      modifier,
      targetKey: "totalLikes",
    });

    if (!result) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.SOMETHING_WENT_WRONG);
    }
    return result;
  }

  // UPDATE BLOG FIELD STATISTICS
  private async blogStatsEditor(input: StatisticsModifier): Promise<BlogDoc> {
    const { targetKey, _id, modifier } = input;

    const result = await this.blogModel
      .findByIdAndUpdate(
        _id,
        {
          $inc: {
            [targetKey]: modifier,
          },
        },
        {
          new: true,
        }
      )

      .exec();

    return result as BlogDoc;
  }

  // GET A BLOG DETAIL
  public async getBlogDetail(
    member: CommonUsers,
    blogId: ObjectId
  ): Promise<BlogDoc> {
    const match: T = {
      blogStatus: BlogStatus.ACTIVE,
      _id: blogId,
    };
    const target = await this.blogModel.findOne(match);

    if (!target) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }

    if (member) {
      const input: ViewInput = {
        viewTargetId: blogId,
        userId: member._id!,
        viewGroup: ViewGroup.BLOG,
      };

      const existView: View | null = await this.viewService.checkViewExistance(
        input
      );

      if (!existView) {
        await this.viewService.insertUserView(input);

        await this.blogStatsEditor({
          _id: blogId,
          targetKey: "views",
          modifier: 1,
        });
      }
    }

    const collectionName =
      target.blogAuthorType === BlogAuthorType.AGENCY
        ? "agencies"
        : target.blogAuthorType.toLowerCase() + "s";

    const [result] = await this.blogModel.aggregate([
      { $match: match },
      commentLookup,
      {
        $lookup: {
          from: collectionName,
          localField: "blogAuthorId",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: "$author" },
      addTotCommentsAvRatingFields,

      {
        $addFields: {
          totalComments: {
            $size: {
              $ifNull: ["$comments", []],
            },
          },
        },
      },
    ]);

    if (!result) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }

    return result;
  }
}

export default BlogService;
