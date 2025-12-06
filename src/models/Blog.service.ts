import { CommonUsers, StatisticsModifier, T } from "../libs/types/common";
import BlogModel, { BlogDoc } from "../schema/Blog.model";
import ViewService from "./View.service";
import {
  BlogDetailOutput,
  BlogInput,
  Blogs,
  SearchBlogTags,
} from "../libs/types/blog";
import UserModel from "../schema/members/User.model";
import AgentModel from "../schema/members/Agent.model";
import AgencyModel from "../schema/members/Agency.model";
import {
  BlogAuthorType,
  BlogDirection,
  BlogStatus,
} from "../libs/enums/blog.enum";
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
import chalk from "chalk";
import likeTargetItem from "../libs/utils/likeTargetItem";
import { pipeline } from "stream";
import { SavingInput } from "../libs/types/userSaving";
import UserSaving from "./UserSaving.service";
import generateMeSavedKey from "../libs/utils/generatedMeSavedKey";

class BlogService {
  private readonly blogModel;
  public readonly viewService;
  public readonly userModel;
  public readonly agentModel;
  public readonly agencyModel;
  public readonly likeService;
  public readonly saveService;

  constructor() {
    this.userModel = UserModel;
    this.blogModel = BlogModel;
    this.viewService = new ViewService();
    this.agentModel = AgentModel;
    this.agencyModel = AgencyModel;
    this.likeService = new LikeService();
    this.saveService = new UserSaving();
  }

  // CALCULATE BLOG FIELD WITH HELPER
  static async updateBlogFields() {
    console.log(chalk.green("✅ Working with updateBlogField static method"));
    const match: T = {
      blogStatus: BlogStatus.ACTIVE,
    };
    await BlogModel.aggregate([
      { $match: match },
      commentLookup,
      addTotCommentsAvRatingFields,
      {
        $addFields: {
          featuredScore: {
            $min: [
              {
                $add: [
                  {
                    $multiply: [{ $ifNull: ["$averageRating", 0] }, 0.35],
                  },
                  {
                    $multiply: [
                      { $ln: { $add: [{ $ifNull: ["$totalLikes", 0] }, 1] } },
                      0.35,
                    ],
                  },
                  {
                    $multiply: [
                      {
                        $ln: { $add: [{ $ifNull: ["$totalComments", 0] }, 1] },
                      },
                      0.15,
                    ],
                  },
                  {
                    $multiply: [
                      { $ln: { $add: [{ $ifNull: ["$views", 0] }, 1] } },
                      0.15,
                    ],
                  },
                ],
              },
              10,
            ],
          },
        },
      },
      {
        $addFields: {
          isTrending: {
            $switch: {
              branches: [
                {
                  case: {
                    $gte: ["$featuredScore", 5],
                  },
                  then: true,
                },
              ],
              default: false,
            },
          },
        },
      },
      {
        $project: {
          comments: 0,
          featuredScore: 0,
        },
      },
      {
        $merge: {
          into: "blogs",
          whenMatched: "merge",
          whenNotMatched: "discard",
        },
      },
    ]);
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
    console.log(blogger);
    try {
      const result = await this.blogModel.create({
        ...input,
        blogAuthorId: blogger?._id,
        blogAuthorType:
          blogger?.role === MemberType.REAL_ESTATE_ADMIN
            ? "User"
            : String(blogger?.role)[0].toUpperCase() +
              blogger?.role.slice(1).toLowerCase(),
        blogAuthor: {
          authorAvatar: blogger?.avatar,
          authorName:
            blogger?.memberName ?? blogger?.fullName ?? blogger?.nickname,
          socials: blogger?.socialLinks ?? blogger?.socials,
          bioInfo: blogger?.bioInfo ?? blogger?.memberDescription,
        },
      });

      return result;
    } catch (error) {
      console.log("Error in postBlog: ", error);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATING_FAILED);
    }
  }

  // GET ALL BLOGS
  public async getAllBlogs(
    member: CommonUsers | null,
    query: T
  ): Promise<Blogs> {
    const { page, limit, title, category, sort } = query;
    const match: T = {
      blogStatus: BlogStatus.ACTIVE,
    };

    if (category) {
      match.blogCategory = category;
    }
    if (title) {
      match.blogTitle = {
        $regex: title,
        $options: "i",
      };
    }

    const sortBlog: T = {
      createdAt: sort === "DESC" ? -1 : 1,
    };

    const pipeline: any[] = [
      {
        $match: match,
      },
      ...likeTargetItem(member?._id),
      {
        $facet: {
          blogs: [
            {
              $skip: (page - 1) * limit,
            },
            {
              $limit: limit,
            },
            { $sort: sortBlog },
          ],
          totalBlogsNumber: [{ $count: "total" }],
        },
      },
    ];
    const [result] = await this.blogModel.aggregate(pipeline);

    if (!result.blogs.length) {
      return { blogs: [], totalBlogsNumber: [{ total: 0 }] };
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
      userId: member._id!,
    };

    const modifier = <number>await this.likeService.toggleLike(input);

    const result = await this.blogStatsEditor({
      _id: id,
      modifier,
      targetKey: "totalLikes",
    });

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

  // TODO - Optimize updating blog fields automatically at night like 0:40 o'clock

  // GET A BLOG DETAIL
  public async getBlogDetail(
    member: CommonUsers,
    blogId: ObjectId
  ): Promise<BlogDetailOutput> {
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

    const pipeline: any[] = [
      {
        $facet: {
          mainBlog: [
            { $match: match },
            ...likeTargetItem(member?._id),
            ...generateMeSavedKey(shapeIntoMongooseObjectId(member?._id)),
          ],
          prevBlog: [
            {
              $match: {
                blogStatus: BlogStatus.ACTIVE,
                blogCategory: target?.blogCategory,
                createdAt: {
                  $lt: target?.createdAt,
                },
              },
            },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
          ],
          nextBlog: [
            {
              $match: {
                blogStatus: BlogStatus.ACTIVE,
                blogCategory: target?.blogCategory,
                createdAt: {
                  $gt: target?.createdAt,
                },
              },
            },
            { $sort: { createdAt: 1 } },
            { $limit: 1 },
          ],
          trendingBlogs: [
            {
              $match: {
                blogStatus: BlogStatus.ACTIVE,
                isTrending: true,
              },
            },
            {
              $sort: { createdAt: -1 },
            },
            {
              $skip: 0,
            },
            {
              $limit: 5,
            },
          ],
        },
      },
    ];
    const [result] = await this.blogModel.aggregate(pipeline);

    return {
      mainBlog: {
        ...result?.mainBlog[0],
        prevBlog: result?.prevBlog[0] ?? null,
        nextBlog: result?.nextBlog[0] ?? null,
      },
      trendingBlogs: result?.trendingBlogs,
    };
  }

  // SEARCH BLOG BY A SPECIFIC TAG NAME
  public async getSearchTag(tag: string): Promise<SearchBlogTags> {
    const blogs = await this.blogModel
      .find({
        blogStatus: BlogStatus.ACTIVE,
        blogTags: { $in: [new RegExp(`^${tag}$`, "i")] },
      })
      .sort({ createdAt: -1 })
      .limit(6);

    return { blogs };
  }

  // GET NEXT OR PREV BLOG
  public async getNeighbouringBlog(query: T): Promise<BlogDoc> {
    const { blogId, direction } = query;

    const match: T = {
      blogStatus: BlogStatus.ACTIVE,
      _id: blogId,
    };
    const target = await this.blogModel.findOne(match);

    if (!target) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }

    const neighbouringMatch: T = {
      blogStatus: BlogStatus.ACTIVE,
    };
    const sort: T = {
      createdAt: 1,
    };

    if (direction === BlogDirection.PREV) {
      neighbouringMatch.createdAt = {
        $lt: target.createdAt,
      };
      sort.createdAt = -1;
    }
    if (direction === BlogDirection.NEXT) {
      neighbouringMatch.createdAt = {
        $gt: target.createdAt,
      };
      sort.createdAt = 1;
    }

    const [result] = await this.blogModel
      .aggregate([
        {
          $match: neighbouringMatch,
        },
        { $sort: sort },
        {
          $limit: 2,
        },
      ])
      .exec();

    if (!result) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }
    return result;
  }

  // SAVE TARGET BLOG
  public async saveTargetBlog(
    blogId: ObjectId,
    query: SavingInput
  ): Promise<BlogDoc> {
    const match: T = {
      blogStatus: BlogStatus.ACTIVE,
      _id: blogId,
    };
    const target = await this.blogModel.findOne(match);
    if (!target) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }
    const modifier = <number>await this.saveService.toggleSave(query);

    const result = await this.blogStatsEditor({
      _id: target?._id,
      modifier,
      targetKey: "totalSavings",
    });

    return result;
  }
}

export default BlogService;
