import mongoose, { now, Schema } from "mongoose";
import bcrypt from "bcrypt";
import { MemberStatus, MemberType } from "../../libs/enums/member.enum";
import validator from "validator";
import { AgencyCurrentBadge } from "../../libs/enums/agency.enum";
import { Agency } from "../../libs/types/agency";

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
      default: MemberType.AGENCY,
    },
    memberName: {
      type: String,
      index: true,
      unique: true,
      required: true,
      trim: true,
    },
    memberEmail: {
      type: String,
      unique: true,
      index: true,
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
      minlength: 7,
      trim: true,
      validate: {
        validator(value: string) {
          return !value.includes("password");
        },
        message: `Type a strong password`,
      },
    },

    address: {
      type: String,
      default: null,
    },
    bioInfo: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
    },

    agencyOwner: {
      type: String,
      default: null,
    },
    registrationNumber: {
      type: String,
      default: null,
    },
    agents: [{ type: Schema.Types.ObjectId, ref: "Agent" }],
    properties: [{ type: Schema.Types.ObjectId, ref: "Property" }],
    agencyBadge: {
      type: String,
      enum: AgencyCurrentBadge,
      default: AgencyCurrentBadge.VERIFIED_AGENCY,
    },
    billingInfo: {
      type: BillingSchema,
      default: () => ({
        planName: "Free",
        subscriptionDate: Date.now(),
        subscriptionStatus: "inactive",
      }),
    },
    city: {
      type: String,
      default: null,
    },
    country: {
      type: String,
      default: null,
    },
    memberSince: {
      type: Date,
      default: Date.now,
    },

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
    viewedBy: {
      type: Schema.Types.ObjectId,
      ref: "View",
    },
    verified: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
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
