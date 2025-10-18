import { CommonUsers, T } from "../libs/types/common";
import BlogModel, { BlogDoc } from "../schema/Blog.model";
import ViewService from "./View.service";
import { BlogInput, Blogs } from "../libs/types/blog";
import UserModel from "../schema/members/User.model";
import AgentModel from "../schema/members/Agent.model";
import AgencyModel from "../schema/members/Agency.model";
import { BlogStatus } from "../libs/enums/blog.enum";
import { MemberStatus, MemberType } from "../libs/enums/member.enum";
import { HttpCode } from "../libs/Errors";
import Errors, { Message } from "../libs/Errors";
import { shapeIntoMongooseObjectId } from "../libs/config";

class BlogService {
  private readonly blogModel;
  public readonly viewService;
  public readonly userModel;
  public readonly agentModel;
  public readonly agencyModel;

  constructor() {
    this.userModel = UserModel;
    this.blogModel = BlogModel;
    this.viewService = new ViewService();
    this.agentModel = AgentModel;
    this.agencyModel = AgencyModel;
  }

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
}

export default BlogService;
