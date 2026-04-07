import multer from "multer";
import multerS3 from "multer-s3";
import crypto from "crypto";
import { Request } from "express";
import { s3 } from "../../config/aws";

export const uploadSettingLogo = multer({
  storage: multerS3({
    s3: s3 as any,
    bucket: process.env.AWS_BUCKET_NAME!,
    contentType: multerS3.AUTO_CONTENT_TYPE,

    metadata: (req: Request, file, cb) => {
      cb(null, {
        fieldName: file.fieldname,
      });
    },

    key: (req: Request, file, cb) => {
      const ext = file.originalname.split(".").pop();
      const fileName = `settings/logo-${crypto.randomBytes(8).toString("hex")}.${ext}`;
      cb(null, fileName);
    },
  }),
});