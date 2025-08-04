/* eslint-disable no-useless-escape */
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryUpload } from "./cloudinary.config";
import multer from "multer";

const storage = new CloudinaryStorage({
  cloudinary: cloudinaryUpload,
  params: {
    public_id: (req, file) => {
      const fileName = file.originalname
        .toLowerCase()
        .replace(/\s+/g, "-") // empty space remove replace with "-"
        .replace(/\./g, "-")
        .replace(/[^a-z0-9\-\.]/g, "");

      const uniqueFileName =
        Math.random().toString(36).substring(2) +
        "-" +
        Date.now() +
        "-" +
        fileName;

      return uniqueFileName;
    },
  },
});

export const multerUpload = multer({ storage: storage });
