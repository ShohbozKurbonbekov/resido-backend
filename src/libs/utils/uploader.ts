import fs from "fs";
import multer from "multer";
import { v4 } from "uuid";
import path from "path";

export const getTargetFileStorage = (address: string) => {
  const uploadPath = `./uploads/${address}`;

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  return multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, `./uploads/${address}`);
    },

    filename: function (req, file, callback) {
      const extension = path.parse(file.originalname).ext;
      const random_name = v4() + extension;
      callback(null, random_name);
    },
  });
};

const makeUploader = (address: string) => {
  const storage = getTargetFileStorage(address);

  return multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 5,
    },

    fileFilter: (req, file, cb) => {
      const hasFile = file.originalname.match(/\.(jpg|jpeg|png|mp4)$/);
      if (!hasFile) {
        return cb(
          new Error(
            `Please provide image formats jpg/jpeg/png and mp4 for videos`
          )
        );
      }

      return cb(null, true);
    },
  });
};

export default makeUploader;
