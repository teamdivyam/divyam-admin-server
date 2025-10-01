import { config } from "../config/_config.js";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
    region: config.AWS_REGION,
    credentials: {
        accessKeyId: config.AWS_BUCKET_KEY,
        secretAccessKey: config.AWS_BUCKET_SECRET,
    },
});

// key can be get from db
const DeleteObject = async (bucketName, objectKey) => {
    try {
        const command = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: objectKey
        });
        const response = await s3Client.send(command);
        return response;
    } catch (error) {
        console.error("Error deleting object:", error.message);
        throw new Error("Error in deleting file from S3");
    }
};

// @params 
// bucketName:STRING and objectKey:STRING

export default DeleteObject