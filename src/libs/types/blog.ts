import { ObjectId } from "mongoose";
import { BlogAuthorType, BlogCategory, BlogStatus } from "../enums/blog.enum";

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
  blogTrending?: boolean;
  blogCategory: BlogCategory;
  createdAt?: Date;
  updatedAt?: Date;
  isFeatured?: boolean;
}
