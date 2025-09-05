import { Router } from "express";
import upload from "../utils/uploads.utils.js";
import {
  deleteVidById,
  getAllVids,
  getVidById,
  getVidThumbnailById,
  uploadVid,
} from "../controllers/videos.controller.js";

const router = Router();

router.post(
  "/upload",

  upload.single("video"),
  uploadVid
);

router.get("/", getAllVids);

router.get("/:id", getVidById);
router.get("/:id/thumbnail", getVidThumbnailById);
router.delete("/:id", deleteVidById);

export default router;
