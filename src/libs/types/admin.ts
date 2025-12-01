import { Request } from "express";
import { Session } from "express-session";
import { UploadFiles, User } from "./user";

export type AdminRequest = Request<{}, any> & {
  member: User;
  session: Session & {
    member: User;
  };
  file: Express.Multer.File;
  files: UploadFiles;
};
