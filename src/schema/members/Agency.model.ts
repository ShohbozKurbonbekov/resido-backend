import mongoose, { InferSchemaType, now, Schema } from "mongoose";
import { MemberStatus, MemberType } from "../../libs/enums/member.enum";
import validator from "validator";
import { AgencyCurrentBadge, AgencyStatus } from "../../libs/enums/agency.enum";
import { AgencyAggregate } from "../../libs/types/agency";

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

const AgencySchema = new Schema<AgencyAggregate>(
  {
    // REQUIRED DATA SETS
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    role: {
      type: String,
      enum: MemberType,
      default: MemberType.AGENCY,
    },
    memberName: {
      type: String,
      required: true,
    },
    memberEmail: {
      type: String,
      unique: true,
      required: true,
      validate: {
        validator(value: string) {
          return validator.isEmail(value);
        },

        message: "Invalid email, check again",
      },
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

    address: {
      type: String,
      required: true,
    },

    agencyOwner: {
      type: String,
      required: true,
    },

    registrationNumber: {
      type: String,
    },

    certificate: {
      type: String,
      required: true,
    },

    licenseNumber: {
      type: String,
      required: true,
      unique: true,
    },

    //THEY ARE GONNA SET IN DB
    views: {
      type: Number,
      default: 0,
    },

    memberStatus: {
      type: String,
      enum: MemberStatus,
      default: MemberStatus.ACTIVE,
    },

    currentStatus: {
      type: String,
      enum: AgencyStatus,
      default: AgencyStatus.PENDING,
    },

    memberSince: {
      type: Date,
      default: Date.now,
    },

    featuredScore: {
      type: Number,
      default: 0,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    // THEY ARE GONNA SET AFTER ADMIN APPROVAL
    permittedProperties: {
      type: Number,
    },

    permittedAgents: {
      type: Number,
    },

    // THEY ARE GONNA SET BY SERVER  IN CALCULATION
    agencyBadge: {
      type: String,
      enum: AgencyCurrentBadge,
    },
    agentsTotalNumber: {
      type: Number,
      default: 0,
    },
    propertiesTotalNumber: {
      type: Number,
      default: 0,
    },

    // OPTIONAL INPUTS BY AGENCY
    socialLinks: {
      type: AgencySocials,
    },
    bioInfo: {
      type: String,
    },
    avatar: {
      type: String,
    },
  },

  {
    timestamps: true,
  } // updatedAt, createdAt
);

AgencySchema.pre("save", async function (next) {
  const user = this;

  if (!user?.registrationNumber) {
    user.registrationNumber = "AC" + "-" + Date.now() + "$" + "RESIDO";
  }

  next();
});

AgencySchema.index({
  memberName: 1,
  role: 1,
  address: 1,
  memberStatus: 1,
  currentStatus: 1,
  isVerified: 1,
});
export type Agency = InferSchemaType<typeof AgencySchema>;

export default mongoose.model<Agency>("Agency", AgencySchema);
