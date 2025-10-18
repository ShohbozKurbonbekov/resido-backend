import BlogService from "../models/Blog.service";
import { T } from "../libs/types/common";
import { ExtendedRequest } from "../libs/types/user";
import { BlogInput, BlogSearchInput } from "../libs/types/blog";
import { Response, Request } from "express";
import Errors, { HttpCode } from "../libs/Errors";

const blogController: T = {};
const blogService = new BlogService();

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

export default blogController;
