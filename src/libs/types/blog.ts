import { ObjectId } from "mongoose";
import { BlogAuthorType, BlogCategory, BlogStatus } from "../enums/blog.enum";
import { TotalCounter } from "./property";
import { BlogDoc } from "../../schema/Blog.model";
import { CommonPageInput } from "./common";

export interface BlogInput {
  _id?: ObjectId;
  blogAuthorType: BlogAuthorType;
  blogShortInfo: string;
  blogAuthorId: ObjectId;
  blogStatus: BlogStatus;
  blogTitle: string;
  blogContent: string;
  blogImage: string;
  blogQuote?: string;
  blogTags: string[];
  views?: number;
  totalLikes?: number;
  totalComments?: number;
  blogCategory: BlogCategory;
  createdAt?: Date;
  updatedAt?: Date;
  averageRating?: number;
}

export interface BlogSearchType {
  title?: string;
  category?: BlogCategory;
}
export interface BlogSearchInput extends CommonPageInput {
  sort: ["DESC", "ASC"];
  search: BlogSearchType;
}

export interface Blogs {
  blogs: BlogDoc[];
  totalBlogsNumber: TotalCounter[];
}

export interface BlogDetailOutput {
  mainBlog: BlogDoc;
  trendingBlogs: BlogDoc[];
}
