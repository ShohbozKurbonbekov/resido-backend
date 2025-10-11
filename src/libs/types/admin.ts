import { Request } from "express";
import { Session } from "express-session";
import { User } from "./user";

export interface AdminRequest extends Request {
  member: User;
  session: Session & {
    member: User;
  };
  file: Express.Multer.File;
  files: Express.Multer.File[];
}
