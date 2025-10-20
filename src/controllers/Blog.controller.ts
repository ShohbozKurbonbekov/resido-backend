import BlogService from "../models/Blog.service";
import { T } from "../libs/types/common";
import { ExtendedRequest } from "../libs/types/user";
import { BlogInput, BlogSearchInput } from "../libs/types/blog";
import { Response, Request } from "express";
import Errors, { HttpCode } from "../libs/Errors";
import { shapeIntoMongooseObjectId } from "../libs/config";

const blogController: T = {};
const blogService = new BlogService();

///////////// ---- POST BLOG ------------- ////////////
blogController.postBlog = async (req: ExtendedRequest, res: Response) => {
  try {
    const input: BlogInput = req.body;
    const member = req.member;

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
blogController.getAllBlogs = async (req: Request, res: Response) => {
  try {
    console.log("getAllBlogs process");

    const input: BlogSearchInput = req.body;
    const { page, limit, search, sort } = input;

    const query: T = {
      page: Number(page) || 1,
      limit: Number(limit) || 6,
      sort: sort || "DESC",
    };

    if (search?.title) query.title = search.title;
    if (search?.category) query.category = search.category;
    const result = await blogService.getAllBlogs(query);

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
    console.log("getBlogDetail process");
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

    const { tag } = req.params;
    const { limit, page } = req.query;
    const query: T = {
      limit: Number(limit) || 1,
      page: Number(page) || 6,
      tag,
    };

    const result = await blogService.getSearchTag(query);

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

export default blogController;
