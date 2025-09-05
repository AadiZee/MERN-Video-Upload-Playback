import { model, Schema } from "mongoose";

const videoSchema = new Schema(
  {
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    uploadDate: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

const Video = model("Video", videoSchema);

export default Video;
