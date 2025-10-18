import mongoose, { InferSchemaType, Schema } from "mongoose";
import { BlogInput } from "../libs/types/blog";
import {
  BlogAuthorType,
  BlogCategory,
  BlogStatus,
} from "../libs/enums/blog.enum";

const BlogSchema = new Schema<BlogInput>(
  {
    blogImage: {
      type: String,
      required: true,
    },
    blogAuthorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "blogAuthorType",
      index: true,
    },
    blogAuthorType: {
      type: String,
      enum: BlogAuthorType,
      required: true,
    },
    blogStatus: {
      type: String,
      enum: BlogStatus,
      required: true,
    },
    blogTitle: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    blogContent: {
      type: String,
      required: true,
      trim: true,
    },
    blogQuote: {
      type: String,
    },
    blogTags: {
      type: [String],
      index: true,
      default: [],
    },
    views: {
      type: Number,
      default: 0,
    },
    totalLikes: {
      type: Number,
      default: 0,
    },
    totalComments: {
      type: Number,
      default: 0,
    },
    blogTrending: {
      type: Boolean,
      default: false,
    },
    blogCategory: {
      type: String,
      enum: BlogCategory,
      required: true,
    },
    blogShortInfo: {
      type: String,
      required: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

BlogSchema.virtual("author", {
  refPath: "blogAuthorType",
  localField: "blogAuthorId",
  foreignField: "_id",
  justOne: true,
});

BlogSchema.index({
  blogAuthorId: 1,
  blogTitle: 1,
  blogCategory: 1,
  blogTags: 1,
});

type BlogDoc = InferSchemaType<typeof BlogSchema>;

export default mongoose.model<BlogDoc>("Blog", BlogSchema);
