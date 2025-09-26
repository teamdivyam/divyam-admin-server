import { v4 as uuidv4 } from "uuid";
import { PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { S3 } from "../config/s3Config.js";
import path from "path";

export const fileUploadS3 = async ({ filePath, file }) => {
  try {
    const ext = path.extname(file.originalname); // e.g. ".png"
    const baseName = path.basename(file.originalname, ext); // e.g. "myImage"

    // Key format: originalName-uuid.ext
    const key = `${filePath}/${baseName}-${uuidv4()}${ext}`;

    // Upload params
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    // Upload file
    const command = new PutObjectCommand(params);
    await S3.send(command);

    // Verify if file exists on S3
    try {
      await S3.send(
        new HeadObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: key,
        })
      );
    } catch (verifyError) {
      throw new Error("File upload failed: could not verify file on S3");
    }

    return `https://assets.divyam.com/${key}`;
  } catch (error) {
    console.error("S3 Upload Error:", error);
    throw new Error("Failed to upload file to S3");
  }
};

export const multipleFileUploadS3 = async ({ filePath, files }) => {
  try {
    if (!Array.isArray(files) || files.length === 0) {
      return;
    }

    // Upload files in parallel
    const uploadPromises = files.map((file) =>
      fileUploadS3({ filePath, file })
    );

    // Wait for all uploads
    const keys = await Promise.all(uploadPromises);

    return keys; // Array of S3 keys
  } catch (error) {
    console.error("S3 Multiple Upload Error:", error);
    throw new Error("Failed to upload multiple files to S3");
  }
};
