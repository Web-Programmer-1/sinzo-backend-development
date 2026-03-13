import multer from "multer";
import multerS3 from "multer-s3";
import crypto from "crypto";
import { Request } from "express";
import { s3 } from "../../config/aws";

export const uploadImage = multer({
  storage: multerS3({
    s3: s3 as any,
    bucket: process.env.AWS_BUCKET_NAME!,
    contentType: multerS3.AUTO_CONTENT_TYPE,

    metadata: (req: Request, file, cb) => {
      cb(null, {
        fieldName: file.fieldname,
        originalName: file.originalname,
      });
    },

    key: (req: Request, file, cb) => {
      let folder = "contents";

      if (req.baseUrl.includes("products")) {
        folder = "products";
      } else if (req.baseUrl.includes("blogs")) {
        folder = "blogs";
      } else if (req.baseUrl.includes("events")) {
        folder = "events";
      }

      const ext = file.originalname.split(".").pop();
      const randomName = crypto.randomBytes(16).toString("hex");

      cb(null, `${folder}/${randomName}.${ext}`);
    },
  }),

  limits: {
    fileSize: 100 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files are allowed"));
    } else {
      cb(null, true);
    }
  },
});


