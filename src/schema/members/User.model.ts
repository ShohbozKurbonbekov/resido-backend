import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import { MemberStatus, MemberType } from "../../libs/enums/member.enum";
import validator from "validator";
import { T } from "../../libs/types/common";
import { User } from "../../libs/types/member";

const UserSchema = new Schema<User>(
  {
    role: {
      type: String,
      enum: MemberType,
      default: MemberType.USER,
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
    isDeleted: {
      type: Boolean,
      default: false,
    },
    userAddress: {
      type: String,
    },
    userDescription: {
      type: String,
    },
    userImage: {
      type: String,
    },

    userFullname: {
      type: String,
    },
  },
  {
    timestamps: true,
  } // updatedAt, createdAt
);

UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject(); //  In Mongoose, the .toObject() method is used to convert a Mongoose document into a plain JavaScript object.
  delete userObject.memberPassword;

  return userObject;
};

UserSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("memberPassword")) {
    const salt: string = await bcrypt.genSalt();
    user.memberPassword = await bcrypt.hash(user.memberPassword, salt);
    next();
  }
});
export default mongoose.model("User", UserSchema);
