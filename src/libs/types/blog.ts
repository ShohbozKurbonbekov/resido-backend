import { ObjectId } from "mongoose";
import { BlogAuthorType, BlogCategory, BlogStatus } from "../enums/blog.enum";
import { TotalCounter } from "./property";
import { BlogDoc } from "../../schema/Blog.model";
import { CommonPageInput, Social } from "./common";
import { OrderRender } from "../enums/common.enum";

export interface BlogAuthor {
  authorAvatar?: string;
  authorName: string;
  socials: Social;
  bioInfo?: string;
}
export interface BlogInput {
  _id?: ObjectId;
  blogAuthorType: BlogAuthorType;
  blogShortInfo: string;
  blogAuthorId: ObjectId;
  blogTitle: string;
  blogContent: string;
  blogImage: string;
  blogQuote?: string;
  blogTags: string[];
  blogStatus?: BlogStatus;
  views?: number;
  totalLikes?: number;
  totalComments?: number;
  blogCategory: BlogCategory;
  createdAt?: Date;
  updatedAt?: Date;
  averageRating?: number;
  blogAuthor: BlogAuthor;
  totalSavings?: number;
}

export interface BlogSearchType {
  title?: string;
  category?: BlogCategory;
}
export interface BlogSearchInput extends CommonPageInput {
  sort?: OrderRender;
  search?: BlogSearchType;
}

export interface Blogs {
  blogs: BlogDoc[];
  totalBlogsNumber: TotalCounter[];
}

export interface MainBlogType {
  blogDetail: BlogDoc;
  prevBlog: BlogDoc | null;
  nextBlog: BlogDoc | null;
}
export interface BlogDetailOutput {
  mainBlog: BlogDoc;
  trendingBlogs: BlogDoc[];
}

export interface SearchBlogTags {
  blogs: BlogDoc[];
}

interface SavedBlog {
  _id: ObjectId;
  blogImage: string;
  blogTitle: string;
  blogShortInfo: string;
  blogCategory: BlogCategory;
  createdAt: Date;
  updatedAt: Date;
}

export interface SavedBlogsOutput {
  blogs: SavedBlog[];
  totalBlogsNumber: TotalCounter[];
}
