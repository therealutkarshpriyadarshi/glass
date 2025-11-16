import axiosInstance from "./server";

interface UploadResponse {
  url: string;
  filename: string;
}

/**
 * Uploads a file to the specified URL.
 *
 * @param {string} url - The URL to upload the file to.
 * @param {File} file - The file to be uploaded.
 * @returns {Promise<UploadResponse>} A promise that resolves with the upload response.
 * @throws {Error} If there's an error during the upload process.
 */
const uploadFile = async (url: string, file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axiosInstance.post<UploadResponse>(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total!
        );
        console.log(`Upload progress: ${percentCompleted}%`);
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

export default uploadFile;
