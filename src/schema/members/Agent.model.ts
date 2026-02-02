import validator, { isStrongPassword } from "validator";
import mongoose, { InferSchemaType, Schema } from "mongoose";
import { Agent } from "../../libs/types/agent";
import { MemberStatus, MemberType } from "../../libs/enums/member.enum";
import bcrypt from "bcrypt";
import { AgentStatus } from "../../libs/enums/agent.enum";
import { SocialsSchema } from "../../libs/utils/SocialsSchema";

const AgentSchema = new Schema<Agent>(
  {
    agencyId: { type: mongoose.Schema.Types.ObjectId, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
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

    featuredScore: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    totalLikes: {
      type: Number,
      defualt: 0,
    },

    totalSavings: {
      type: Number,
      default: 0,
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
    },
    certificate: {
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
    socialLinks: {
      type: SocialsSchema,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    rank: {
      type: String,
    },
  },
  { timestamps: true },
);

AgentSchema.index({
  _id: 1,
  currentStatus: 1,
  memberStatus: 1,
  createdAt: -1,
  isVerified: 1,
  agencyId: 1,
});

export type AgentDoc = InferSchemaType<typeof AgentSchema>;
export default mongoose.model("Agent", AgentSchema);
