import BlogService from "../models/Blog.service";
import { T } from "../libs/types/common";
import { ExtendedRequest, UploadRequest } from "../libs/types/user";
import { BlogInput, BlogSearchInput } from "../libs/types/blog";
import { Response, Request } from "express";
import Errors, { HttpCode } from "../libs/Errors";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { orrangeFiles } from "../libs/utils/orrangeFiles";
import { SavingInput } from "../libs/types/userSaving";
import { TargetGroup } from "../libs/enums/userSaving.enum";

const blogController: T = {};
const blogService = new BlogService();

///////////// ---- POST BLOG ------------- ////////////
blogController.postBlog = async (req: UploadRequest, res: Response) => {
  try {
    const parsedTags = req.body.blogTags ? JSON.parse(req.body.blogTags) : [];
    const input: BlogInput = req.body;
    input.blogTags = parsedTags;
    const member = req.member;
    if (req.files?.blogImage?.length) {
      input.blogImage = orrangeFiles(req.files?.blogImage).join("");
    }

    const result = await blogService.postBlog(member, input);

    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in postBlog: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

////////////////// ---- GET ALL BLOGS ------- //////////////
blogController.getAllBlogs = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("getAllBlogs process");
    const member = req?.member;
    const input: BlogSearchInput = req.body;
    const { page, limit, search, sort } = input;

    const query: T = {
      page: Number(page) || 1,
      limit: Number(limit) || 6,
      sort: sort || "DESC",
    };

    if (search?.title) query.title = search.title;
    if (search?.category) query.category = search.category;
    const result = await blogService.getAllBlogs(member, query);

    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in getAllBlogs: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

//////////////// ----- LIKE TARGET BLOG ------//////////////
blogController.likeTargetBlog = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("LikeTargetBlog process");
    const id = shapeIntoMongooseObjectId(req.body.input);
    const member = req.member;

    const result = await blogService.likeTargetBlog(member, id);

    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in likeTargetBlog: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

///////////////////// ----  GET BLOG DETAIL -----/////////
blogController.getBlogDetail = async (req: ExtendedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const member = req.member;
    const blogId = shapeIntoMongooseObjectId(id);

    const result = await blogService.getBlogDetail(member, blogId);

    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in getBlogDetail: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

/////////////// --- SEARCH BLOG BY TAG ----- /////////////
blogController.blogSearchTag = async (req: Request, res: Response) => {
  try {
    console.log("blogSearchTag process");
    const { tag } = req.query;
    const result = await blogService.getSearchTag(String(tag));

    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in BlogSearchTag: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

///////////// ----- GET NEIGHBOURIG BLOG ------- /////////
blogController.getNeighbouringBlog = async (req: Request, res: Response) => {
  try {
    console.log("getNeighbouringBlog process");
    const { id } = req.params;
    const { direction } = req.query;
    const blogId = shapeIntoMongooseObjectId(id);

    const query: T = {
      blogId,
      direction,
    };

    const result = await blogService.getNeighbouringBlog(query);

    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in getNeighbouringBlog :", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

////////////// -------------- SAVE TARGET BLOG --------------//////////////
blogController.saveTargetBlog = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("save targetBlog proccess");
    const { id } = req.params;
    const blogId = shapeIntoMongooseObjectId(id);
    const query: SavingInput = {
      targetId: shapeIntoMongooseObjectId(blogId),
      targetGroup: TargetGroup.BLOG,
      userId: shapeIntoMongooseObjectId(req?.member?._id),
    };
    const result = await blogService.saveTargetBlog(blogId, query);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in saveTargetBlog process: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};
export default blogController;
