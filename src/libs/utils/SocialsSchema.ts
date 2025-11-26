import { Schema } from "mongoose";

export const SocialsSchema = new Schema(
  {
    facebook: { type: String, default: null },
    twitter: { type: String, default: null },
    instagram: { type: String, default: null },
    linkedin: { type: String, default: null },
    email: { type: String, default: null },
  },
  { _id: false }
);
