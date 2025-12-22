import mongoose, { InferSchemaType, now, Schema } from "mongoose";
import bcrypt from "bcrypt";
import { MemberStatus, MemberType } from "../../libs/enums/member.enum";
import validator from "validator";
import {
  AgencyCurrentBadge,
  SubscriptionStatus,
  SubscriptionTarrif,
} from "../../libs/enums/agency.enum";
import { AgencyMemberInput, BillingDetails } from "../../libs/types/agency";
import { defineLocale } from "moment/ts3.1-typings/moment";

const AgencySocials = new Schema(
  {
    facebook: { type: String, default: null },
    twitter: { type: String, default: null },
    instagram: { type: String, default: null },
    linkedin: { type: String, default: null },
    email: { type: String, default: null },
  },
  { _id: false }
);

const BillingSchema = new Schema(
  {
    planName: {
      type: String,
      enum: SubscriptionTarrif,
      default: SubscriptionTarrif.FREE,
    },
    subscriptionDate: { type: Date, default: Date.now },
    subscriptionStatus: {
      type: String,
      enum: SubscriptionStatus,
      default: SubscriptionStatus.INACTIVE,
    },
  },
  { _id: false }
);

const AgencySchema = new Schema<AgencyMemberInput>(
  {
    // REQUIRED DATA SETS
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
      unique: true,
      required: true,
    },
    yearOfExperience: {
      type: Number,
      required: true,
    },
    memberPassword: {
      type: String,
      index: true,
      required: true,
      minlength: 7,
      trim: true,
      validate: {
        validator(value: string) {
          return !value.includes("password");
        },
        message: `Don't include  key password`,
      },
    },

    address: {
      type: String,
      required: true,
      index: true,
    },
    bioInfo: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },

    agencyOwner: {
      type: String,
      required: true,
    },

    //THEY ARE GONNA SET IN DB
    memberSince: {
      type: Date,
      default: Date.now,
    },

    permittedProperties: {
      type: Number,
      default: 0,
    },

    // THEY ARE GONNA SET AFTER ADMIN APPROVAL
    agencyBadge: {
      type: String,
      enum: AgencyCurrentBadge,
    },
    registrationNumber: {
      type: String,
    },

    /// OTHERS
    agentsTotalNumber: {
      type: Number,
      default: 0,
    },
    propertiesTotalNumber: {
      type: Number,
      default: 0,
    },
    featuredScore: {
      type: Number,
      default: 0,
    },
    billingInfo: {
      type: BillingSchema,
      default: () => ({}),
    },

    socialLinks: {
      type: AgencySocials,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
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
  }
  if (!user?.registrationNumber) {
    user.registrationNumber = "AC" + "-" + Date.now() + "$" + "RESIDO";
  }

  next();
});

export type Agency = InferSchemaType<typeof AgencySchema>;

export default mongoose.model<Agency>("Agency", AgencySchema);
