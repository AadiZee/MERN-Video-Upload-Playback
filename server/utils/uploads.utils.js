import multer from "multer";
import storage from "../configs/multer.config.js";
import fileFilter from "./file.utils.js";

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

export default upload;
