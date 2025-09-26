import { DeleteObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { S3 } from "../config/s3Config.js";

export const deleteFileS3 = async (fileUrl) => {
  try {
    if (!fileUrl) {
      return;
    }

    // Remove domain if full URL is provided
    const key = fileUrl.replace(/^https?:\/\/[^/]+\//, "");

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    };

    const command = new DeleteObjectCommand(params);
    await S3.send(command);

    return { success: true, message: `File deleted: ${key}` };
  } catch (error) {
    console.error("S3 Delete Error:", error);
    throw new Error("Failed to delete file from S3");
  }
};

export const deleteMultipleFilesS3 = async (fileUrls) => {
  try {
    if (!Array.isArray(fileUrls) || fileUrls.length === 0) {
      return;
    }

    // Strip domain from each URL
    const keys = fileUrls.map((url) => url.replace(/^https?:\/\/[^/]+\//, ""));
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
        Quiet: false, // if true, won't return deleted keys in response
      },
    };

    const command = new DeleteObjectsCommand(params);
    const response = await S3.send(command);

    return {
      success: true,
      deleted: response.Deleted || [],
      errors: response.Errors || [],
    };
  } catch (error) {
    console.error("S3 Multiple Delete Error:", error);
    throw new Error("Failed to delete multiple files from S3");
  }
};
