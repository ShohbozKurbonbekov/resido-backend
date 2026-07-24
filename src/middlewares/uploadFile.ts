import { NextFunction, RequestHandler, Response, Request } from "express";
import makeUploader from "../libs/utils/uploader";
import { HttpCode } from "../libs/Errors";

interface FieldValueType {
  name: string;
  maxCount: number;
}

const uploadFiles = (
  fileName: string,
  imgKey?: string,
  maxImgLimit?: number,
  imgAvailable?: boolean,
  videoAvailabe?: boolean,
  videoKey?: string,
  maxVideoLimit?: number,
): RequestHandler => {
  const middleware = (req: Request, res: Response, next: NextFunction) => {
    const fieldValue: FieldValueType[] = [];

    // FOR IMAGE UPLOAD
    if (imgAvailable && imgKey && maxImgLimit) {
      fieldValue.push({ name: imgKey, maxCount: maxImgLimit });
    }

    // FOR  VIDEO UPLOAD
    if (videoAvailabe && videoKey && maxVideoLimit) {
      fieldValue.push({ name: videoKey, maxCount: maxVideoLimit });
    }

    const upload = makeUploader(fileName).fields([...fieldValue]);

    upload(req, res, (error: any) => {
      if (error) {
        return res.status(error?.code ?? HttpCode.FORBIDDEN).json(error);
      }

      next();
    });
  };

  return middleware as RequestHandler;
};

export default uploadFiles;
