import asyncHandler from "express-async-handler";
import path from "path";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import Video from "../models/video.model.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadVid = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded!" });

  const video = new Video({
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
  });

  await video.save();

  return res.json({ message: "Video uploaded", video: video });
});

export const getAllVids = asyncHandler(async (req, res) => {
  const videos = await Video.find().sort({ uploadDate: -1 });
  return res.json(videos);
});

export const getVidById = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) {
    return res.status(404).json({ error: "Video not found" });
  }

  const videoPath = path.join(__dirname, "..", "uploads", video.filename);

  if (!fs.existsSync(videoPath)) {
    return res.status(404).json({ error: "Video file not found" });
  }

  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  // Resolve a safe content type
  const extension = path.extname(video.filename || "").toLowerCase();
  const extensionToMime = {
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".ogg": "video/ogg",
    ".mov": "video/quicktime",
    ".mkv": "video/x-matroska",
    ".avi": "video/x-msvideo",
    ".wmv": "video/x-ms-wmv",
    ".m4v": "video/x-m4v",
  };
  const resolvedContentType =
    video.mimetype || extensionToMime[extension] || "application/octet-stream";

  if (range) {
    // Parse range header
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    const chunksize = end - start + 1;
    const file = fs.createReadStream(videoPath, { start, end });

    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": resolvedContentType,
      "Access-Control-Allow-Origin": "http://localhost:3000",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
      "Access-Control-Allow-Headers": "Content-Type, Range",
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    // Send entire file
    const head = {
      "Content-Length": fileSize,
      "Content-Type": resolvedContentType,
      "Access-Control-Allow-Origin": "http://localhost:3000",
      "Accept-Ranges": "bytes",
    };

    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
});

export const deleteVidById = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) {
    return res.status(404).json({ error: "Video not found" });
  }

  const videoPath = path.join(__dirname, "uploads", video.filename);
  if (fs.existsSync(videoPath)) {
    fs.unlinkSync(videoPath);
  }

  await Video.findByIdAndDelete(req.params.id);
  res.json({ message: "Video deleted successfully" });
});

export const getVidThumbnailById = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) {
    return res.status(404).json({ error: "Video not found" });
  }

  const videoPath = path.join(__dirname, "..", "uploads", video.filename);
  if (!fs.existsSync(videoPath)) {
    return res.status(404).json({ error: "Video file not found" });
  }

  const thumbnailsDir = path.join(__dirname, "..", "uploads", "thumbnails");
  if (!fs.existsSync(thumbnailsDir)) {
    fs.mkdirSync(thumbnailsDir, { recursive: true });
  }

  const thumbPath = path.join(thumbnailsDir, `${video._id}.jpg`);

  if (fs.existsSync(thumbPath)) {
    return res.sendFile(thumbPath);
  }

  await new Promise((resolve, reject) => {
    // ensure ffmpeg binary is set (bundled installer)
    try {
      if (ffmpegInstaller && ffmpegInstaller.path) {
        ffmpeg.setFfmpegPath(ffmpegInstaller.path);
      }
    } catch (_) {}

    try {
      ffmpeg(videoPath)
        .on("end", () => resolve())
        .on("error", (err) => reject(err))
        .screenshots({
          count: 1,
          timemarks: ["1"],
          filename: `${video._id}.jpg`,
          folder: thumbnailsDir,
          size: "320x?",
        });
    } catch (err) {
      reject(err);
    }
  });

  if (!fs.existsSync(thumbPath)) {
    return res.status(500).json({ error: "Failed to generate thumbnail" });
  }

  return res.sendFile(thumbPath);
});
