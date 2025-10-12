import validator, { isStrongPassword } from "validator";
import mongoose, { model, Schema } from "mongoose";
import { Agent } from "../../libs/types/agent";
import { MemberStatus, MemberType } from "../../libs/enums/member.enum";
import bcrypt from "bcrypt";
import { AgentStatus } from "../../libs/enums/agent.enum";

const AgentSchema = new Schema<Agent>(
  {
    agencyId: { type: String, required: true },
    nickname: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    fullName: {
      type: String,
      trim: true,
      required: true,
    },
    memberEmail: {
      type: String,
      unique: true,
      trim: true,
      required: true,
      validate: {
        validator: (value) => {
          return validator.isEmail(value);
        },
        message: "Please give a valid email",
      },
    },
    featuredScore: {
      type: Number,
    },
    views: {
      type: Number,
      default: 0,
    },
    totalLikes: {
      type: Number,
      defualt: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    totalComments: {
      type: Number,
      default: 0,
    },
    currentStatus: {
      type: String,
      enum: AgentStatus,
      default: AgentStatus.PENDING,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    memberPassword: {
      type: String,
      required: true,
      trim: true,
      select: false,
      validate: {
        validator: (value) => {
          return isStrongPassword(value, {
            minLength: 7,
            minLowercase: 1,
            minSymbols: 1,
            minUppercase: 1,
            minNumbers: 3,
          });
        },
        message:
          "Please, Make sure that You are providing at leat 7 characters with at least one lowercase letter, one symbol, one uppercase and 3 numbers ",
      },
    },
    role: {
      type: String,
      enum: MemberType,
      default: MemberType.AGENT,
    },

    address: {
      type: String,
      required: true,
    },
    memberStatus: {
      type: String,
      enum: MemberStatus,
      default: MemberStatus.ACTIVE,
    },
    yearOfExperience: {
      type: Number,
      required: true,
    },
    bioInfo: {
      type: String,
      required: true,
    },
    licenseNumber: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
    points: {
      type: Number,
      default: 0,
    },
    properties: [{ type: Schema.Types.ObjectId, ref: "Property" }],
    socialLinks: {
      instagram: { type: String, default: null },
      twitter: { type: String, default: null },
      facebook: {
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
    isVerified: {
      type: Boolean,
      default: false,
    },
    rank: {
      type: String,
    },
  },
  { timestamps: true }
);

AgentSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject(); //  In Mongoose, the .toObject() method is used to convert a Mongoose document into a plain JavaScript object.
  delete userObject.memberPassword;

  return userObject;
};

AgentSchema.pre("save", async function (next) {
  // HASHING PASSWORD
  const user: any = this;
  if (user.isModified("memberPassword")) {
    const salt: string = await bcrypt.genSalt();
    user.memberPassword = await bcrypt.hash(user.memberPassword, salt);

    next();
  }
});
export default mongoose.model("Agent", AgentSchema);
