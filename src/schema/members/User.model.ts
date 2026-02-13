import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import { MemberStatus, MemberType } from "../../libs/enums/member.enum";
import validator from "validator";
import { User } from "../../libs/types/user";
import {
  AdminDashboardOverviewType,
  AdminGlobalStatsType,
  AdminPersonalStatsType,
} from "../../libs/types/admin";

const AdminGlobalStatsSchema = new Schema<AdminGlobalStatsType>(
  {
    agencies: {
      type: Number,
      required: true,
    },
    agents: {
      type: Number,
      required: true,
    },
    blogs: {
      type: Number,
      required: true,
    },
    comments: {
      type: Number,
      required: true,
    },
    properties: {
      type: Number,
      required: true,
    },
    tariffs: {
      type: Number,
      required: true,
    },
    users: {
      type: Number,
      required: true,
    },
  },

  { _id: false },
);

const AdminPersonalStatsSchema = new Schema<AdminPersonalStatsType>(
  {
    myBlogs: {
      type: Number,
      required: true,
    },
    myMessages: {
      type: Number,
      required: true,
    },
    notifications: {
      type: Number,
      required: true,
    },
  },

  { _id: false },
);
const AdminOverviewStatsSchema = new Schema<AdminDashboardOverviewType>({
  adminId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  globalStats: AdminGlobalStatsSchema,
  personalStats: AdminPersonalStatsSchema,
  generatedAt: {
    type: Date,
    required: true,
  },
});

const Socials = new Schema(
  {
    facebook: {
      type: String,
      default: null,
    },
    twitter: {
      type: String,
      default: null,
    },
    instagram: {
      type: String,
      default: null,
    },
    linkedin: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      default: null,
    },
  },
  {
    _id: false,
  },
);

const UserSchema = new Schema<User>(
  {
    role: {
      type: String,
      enum: MemberType,
      default: MemberType.USER,
    },

    agentMode: {
      type: Boolean,
      default: false,
    },
    agencyMode: {
      type: Boolean,
      default: false,
    },
    memberName: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    memberEmail: {
      type: String,
      index: true,
      unique: true,
      required: true,
      validate: {
        validator(value: string) {
          return validator.isEmail(value);
        },

        message: "Invalid email, check again",
      },
    },
    memberStatus: {
      type: String,
      enum: MemberStatus,
      default: MemberStatus.ACTIVE,
    },

    memberPhone: {
      type: String,
      index: true,
      unique: true,
      required: true,
    },

    memberPassword: {
      type: String,
      select: false,
      required: true,
      minLength: 7,
      trim: true,
      validate: {
        validator(value: string) {
          return !value.includes("password");
        },
        message: `Type a strong password`,
      },
    },
    memberAddress: {
      type: String,
    },
    memberDescription: {
      type: String,
    },
    memberSocials: {
      type: Socials,
      default: () => ({}),
    },
    agentApplicationId: {
      type: Schema.Types.ObjectId,
    },
    avatar: {
      type: String,
    },

    userFullname: {
      type: String,
    },
    occupation: {
      type: String,
      required: true,
    },

    adminOverviewStats: {
      type: AdminOverviewStatsSchema,
    },
  },
  {
    timestamps: true,
  },
);

UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.memberPassword;

  return userObject;
};

UserSchema.index({
  role: 1,
  memberEmail: 1,
  memberPassword: 1,
  memberStatus: 1,
});
UserSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("memberPassword")) {
    const salt: string = await bcrypt.genSalt();
    user.memberPassword = await bcrypt.hash(user.memberPassword, salt);
    next();
  }
});
export default mongoose.model("User", UserSchema);
