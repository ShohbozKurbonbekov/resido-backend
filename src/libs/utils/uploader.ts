import multer from "multer";
import { v4 } from "uuid";
import path from "path";

const getTargetImageStorage = (address: string) => {
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
  const storage = getTargetImageStorage(address);

  return multer({
    storage: storage,
    limits: {
      fileSize: 100_000,
    },

    fileFilter: (req, file, cb) => {
      const hasFIle = file.originalname.match(/\.(jpg|jpeg|png)$/);
      if (!hasFIle) {
        return cb(new Error(`Please provide jpg/jpeg/png format of the image`));
      }

      cb(null, true);
    },
  });
};

export default makeUploader;
