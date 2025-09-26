import validator from "validator";
import mongoose, { model, Schema } from "mongoose";
import { Agent } from "../../libs/types/agent";
import { MemberStatus, MemberType } from "../../libs/enums/member.enum";
import bcrypt from "bcrypt";
const AgentSchema = new Schema<Agent>(
  {
    agencyId: { type: String, required: true },
    nickname: {
      type: String,
      index: true,
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
      index: true,
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

    phone: {
      type: String,
      required: true,
      index: true,
      unique: true,
      trim: true,
    },
    memberPassword: {
      type: String,
      required: true,
      minlength: 7,
      trim: true,
      select: false,
      validate: {
        validator: (value) => {
          return !value.includes("password");
        },
        message: "Don't include (passord) key",
      },
    },
    memberStatus: {
      type: String,
      enum: MemberStatus,
      default: MemberStatus.ACTIVE,
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
      default: null,
    },
    avatar: {
      type: String,
    },
    points: {
      type: Number,
      default: 0,
    },
    properties: [{ type: Schema.Types.ObjectId, ref: "Property" }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
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
  const user = this;
  if (user.isModified("memberPassword")) {
    const salt: string = await bcrypt.genSalt();
    user.memberPassword = await bcrypt.hash(user.memberPassword, salt);
    next();
  }
});
export default mongoose.model("Agent", AgentSchema);
