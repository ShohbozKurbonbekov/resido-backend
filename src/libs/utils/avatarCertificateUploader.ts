import express from "express";
import multer from "multer";
import { getTargetFileStorage } from "./uploader";

const uploadAvatarCerticateFiles = (address: string) => {
  const storage = getTargetFileStorage(address);

  return multer({
    storage: storage,
    limits: {
      fileSize: 5000_000,
    },

    fileFilter: (_, file, cb) => {
      if (file.fieldname === "avatar" && file.mimetype.startsWith("image/")) {
        const hasFile = file.originalname.match(/\.(jpg|jpeg|png)$/);
        if (!hasFile) {
          return cb(new Error(`Please provide image formats -  jpg/jpeg/png!`));
        }
        return cb(null, true);
      }

      if (file.fieldname === "certificate") {
        if (file.mimetype !== "application/pdf") {
          return cb(new Error("Certificate must be a PDF"));
        }
        return cb(null, true);
      }

      cb(new Error("Something wrong with file uploading"));
    },
  });
};

export default uploadAvatarCerticateFiles;
