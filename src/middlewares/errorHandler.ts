import { Request, Response, NextFunction } from "express";
import multer from "multer";
import Errors, { HttpCode } from "../libs/Errors";

function multerErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log("🔥 Multer error handler hit:", err?.message);

  if (!err) return next();

  return res.status(HttpCode.BAD_REQUEST).json({ message: err.message });
}

export default multerErrorHandler;
