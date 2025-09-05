import axios from "axios";

const API_URL = `/api/vid`;

export const fetchAllVideos = async () => {
  try {
    const res = await axios.get(API_URL);
    return res;
  } catch (error) {
    console.error("Error fetching videos from server: ", error);
  }
};

export const uploadVideo = async (formData, setUploadProgress) => {
  try {
    const res = await axios.post(`${API_URL}/upload`, formData, {
      onUploadProgress: (progressEvent) => {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setUploadProgress(percent);
      },
    });

    return res;
  } catch (error) {
    console.error("Error uploading video to server: ", error);
  }
};

export const deleteVideo = async (videoId) => {
  try {
    const res = await axios.delete(`${API_URL}/${videoId}`);
    return res;
  } catch (error) {
    console.error("Error deleting video from server: ", error);
  }
};
