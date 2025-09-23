import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import { MemberStatus, MemberType } from "../libs/enums/member.enum";
import validator from "validator";
import { T } from "../libs/types/common";
import { User } from "../libs/types/member";

const UserSchema = new Schema<User>(
  {
    role: {
      type: String,
      enum: MemberType,
      default: MemberType.USER,
    },
    userName: {
      type: String,
      index: { unique: true },
      required: true,
      trim: true,
    },
    userEmail: {
      type: String,
      index: { unique: true },
      required: true,
      validator: {
        validator(value: string) {
          return validator.isEmail(value);
        },

        message: "Invalid email, chech again",
      },
    },
    userStatus: {
      type: String,
      enum: MemberStatus,
      default: MemberStatus.ACTIVE,
    },

    userPhone: {
      type: String,
      index: {
        unique: true,
      },
      required: true,
    },

    userPassword: {
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
  delete userObject.userPassword;

  return userObject;
};

UserSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("userPassword")) {
    const salt: string = await bcrypt.genSalt();
    user.userPassword = await bcrypt.hash(user.userPassword, salt);
    next();
  }
});
export default mongoose.model("User", UserSchema);
