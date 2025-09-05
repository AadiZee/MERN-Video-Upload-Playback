import { useEffect, useState } from "react";
import "./App.css";
import {
  deleteVideo,
  fetchAllVideos,
  uploadVideo,
} from "./services/videos.services";

function App() {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchVideos = async () => {
    try {
      const response = await fetchAllVideos();
      setVideos(response?.data || []);
    } catch (error) {
      console.error("Error fetching videos: ", error);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e?.target?.files[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      alert("Please upload a video file!");
      return;
    }

    const formData = new FormData();
    formData.append("video", file);

    setUploading(true);
    setUploadProgress(0);

    try {
      const response = await uploadVideo(formData, setUploadProgress);
      setVideos([response.data.video, ...videos]);

      e.target.value = "";
    } catch (error) {
      console.log("Upload error: ", error.message);
      return alert("Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
  };

  const handleVideoDelete = async (videoId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are u sure u want to delete this video?")) {
      return;
    }

    try {
      await deleteVideo(videoId);
      setVideos(videos.filter((vid) => vid._id !== videoId));

      if (selectedVideo && selectedVideo.id === videoId) {
        setSelectedVideo(null);
      }

      alert("Video deleted!");
    } catch (error) {
      console.log("Video deletion error: ", error.message);
      return alert("Video deletion failed");
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Video Streaming App</h1>

        <div className="upload-section">
          <label htmlFor="video-upload" className="upload-button">
            {uploading
              ? `Uploading... ${uploadProgress}%`
              : "Choose Video to Upload"}
          </label>
          <input
            id="video-upload"
            type="file"
            accept="video/*"
            onChange={handleFileUpload}
            disabled={uploading}
            style={{ display: "none" }}
          />

          {uploading && (
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
        </div>
      </header>

      <main className="main-content">
        {/* Video Player Section */}
        {selectedVideo && (
          <div className="video-player-section">
            <h2>Now Playing: {selectedVideo.originalName}</h2>
            <video
              autoPlay
              key={selectedVideo._id}
              controls
              width="800"
              height="450"
              className="video-player"
              poster={`/api/vid/${selectedVideo?._id}/thumbnail`}
            >
              <source
                src={`/api/vid/${selectedVideo?._id}`}
                type={selectedVideo.mimeType}
              />
              Your browser does not support the video tag.
            </video>

            <div className="video-info">
              <p>
                <strong>File Size:</strong> {formatFileSize(selectedVideo.size)}
              </p>
              <p>
                <strong>Uploaded:</strong>{" "}
                {formatDate(selectedVideo.uploadDate)}
              </p>
            </div>
          </div>
        )}

        {/* Video List Section */}
        <div className="video-list-section">
          <h2>Video Library ({videos.length} videos)</h2>

          {videos.length === 0 ? (
            <div className="empty-state">
              <p>
                No videos uploaded yet. Upload your first video to get started!
              </p>
            </div>
          ) : (
            <div className="video-grid">
              {videos.map((video) => (
                <div
                  key={video._id}
                  className={`video-card ${
                    selectedVideo?._id === video._id ? "selected" : ""
                  }`}
                  onClick={() => handleVideoSelect(video)}
                >
                  <div className="video-thumbnail">
                    <img
                      src={`/api/vid/${video._id}/thumbnail`}
                      alt={video.originalName}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <div className="play-icon">▶</div>
                    <div className="video-duration">
                      {formatFileSize(video.size)}
                    </div>
                  </div>

                  <div className="video-details">
                    <h3 className="video-title">{video.originalName}</h3>
                    <p className="video-meta">{formatDate(video.uploadDate)}</p>
                  </div>

                  <button
                    className="delete-button"
                    onClick={(e) => handleVideoDelete(video._id, e)}
                    title="Delete video"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
