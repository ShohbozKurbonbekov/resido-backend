import mongoose, { InferSchemaType, Schema } from "mongoose";
import { BlogAuthor, BlogInput } from "../libs/types/blog";
import {
  BlogAuthorType,
  BlogCategory,
  BlogStatus,
} from "../libs/enums/blog.enum";
import { SocialsSchema } from "../../src/libs/utils/SocialsSchema";

const BlogAuthorSchema = new Schema<BlogAuthor>(
  {
    authorAvatar: {
      type: String,
    },
    authorName: {
      type: String,
      required: true,
    },
    bioInfo: {
      type: String,
    },
    socials: {
      type: SocialsSchema,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const BlogSchema = new Schema<BlogInput>(
  {
    blogImage: {
      type: String,
      required: true,
    },
    blogAuthorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
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
      default: BlogStatus.ACTIVE,
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
    totalSavings: {
      type: Number,
      default: 0,
    },
    totalComments: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
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
    blogAuthor: {
      type: BlogAuthorSchema,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// BlogSchema.virtual("author", {
//   refPath: "blogAuthorType",
//   localField: "blogAuthorId",
//   foreignField: "_id",
//   justOne: true,
// });

BlogSchema.index({
  blogAuthorId: 1,
  blogTitle: 1,
  blogCategory: 1,
  blogTags: 1,
});

export type BlogDoc = InferSchemaType<typeof BlogSchema>;

export default mongoose.model<BlogDoc>("Blog", BlogSchema);
