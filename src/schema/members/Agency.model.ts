import mongoose, { now, Schema } from "mongoose";
import bcrypt from "bcrypt";
import { MemberStatus, MemberType } from "../../libs/enums/member.enum";
import validator from "validator";
import { T } from "../../libs/types/common";
import { Agency, User } from "../../libs/types/member";
import { AgencyCurrentBadge } from "../../libs/enums/agency.enum";

const BillingSchema = new Schema(
  {
    planName: {
      type: String,
      enum: ["Free", "Standard", "Premium"],
      required: true,
      default: "Free",
    },
    subscriptionDate: { type: Date, default: Date.now },
    subscriptionStatus: {
      type: String,
      enum: ["active", "inactive", "cancelled"],
      required: true,
      default: "inactive",
    },
  },
  { _id: false }
);

const AgencySchema = new Schema<Agency>(
  {
    role: {
      type: String,
      enum: MemberType,
      default: MemberType.USER,
    },
    memberName: {
      type: String,
      index: { unique: true },
      required: true,
      trim: true,
    },
    memberEmail: {
      type: String,
      required: true,
      validator: {
        validator(value: string) {
          return validator.isEmail(value);
        },

        message: "Invalid email, chech again",
      },
    },
    memberStatus: {
      type: String,
      enum: MemberStatus,
      default: MemberStatus.ACTIVE,
    },

    memberPhone: {
      type: String,
      index: {
        unique: true,
      },
      required: true,
    },

    memberPassword: {
      type: String,
      select: false,
      required: true,
      minLength: 7,
      trim: true,
      validator: {
        validator(value: string) {
          return !value.includes("password");
        },
        message: `Don't include (password) key in your inputs`,
      },
    },

    address: {
      type: String,
    },
    bioInfo: {
      type: String,
    },
    avatar: {
      type: String,
    },

    agencyOwner: {
      type: String,
    },
    registrationNumber: {
      type: String,
    },
    agents: {
      type: [],
    },
    agenycBadge: {
      type: String,
      enum: AgencyCurrentBadge,
      default: AgencyCurrentBadge.VERIFIED_AGENCY,
    },
    billingInfo: {
      type: BillingSchema,
      default: {
        planName: "Free",
        subscriptionDate: new Date(),
        subscriptionStatus: "inactive",
      },
    },
    city: {
      type: String,
    },
    country: {
      type: String,
    },
    memberSince: {
      type: Number,
      default: new Date(),
    },
    properties: [],
    socialLinks: {
      instagram: { type: String, default: null },
      twitter: { type: String, default: null },
      facbook: {
        type: String,
        default: null,
      },
      linkedin: {
        type: String,
        default: null,
      },
      emial: {
        type: String,
        defult: null,
      },
    },
    views: {
      type: Number,
      default: 0,
    },
  },

  {
    timestamps: true,
  } // updatedAt, createdAt
);

AgencySchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject(); //  In Mongoose, the .toObject() method is used to convert a Mongoose document into a plain JavaScript object.
  delete userObject.memberPassword;

  return userObject;
};

AgencySchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("memberPassword")) {
    const salt: string = await bcrypt.genSalt();
    user.memberPassword = await bcrypt.hash(user.memberPassword, salt);
    next();
  }
});
export default mongoose.model("Agency", AgencySchema);
