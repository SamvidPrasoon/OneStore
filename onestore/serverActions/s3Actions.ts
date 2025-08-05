"use server";
import {
  BucketLocationConstraint,
  CreateBucketCommand,
  DeleteBucketCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
  PutBucketEncryptionCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { File } from "buffer";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
export const storeS3Creds = async (
  accessKey: string,
  secretKey: string,
  region: string,
  sessionToken: string
) => {
  const data = JSON.stringify({
    accessKey,
    secretKey,
    sessionToken,
    region,
  });
  (await cookies()).set("aws_temp_creds", data, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60, // 1 hour
    path: "/",
  });
};

export const getS3Client = async () => {
  const raw = (await cookies()).get("aws_temp_creds")?.value;
  if (!raw) {
    redirect("/");
  }

  const { accessKey, secretKey, sessionToken, region } = JSON.parse(raw);
  const s3 = new S3Client({
    region: region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
      sessionToken: sessionToken,
    },
  });

  return s3;
};

export const listBuckets = async () => {
  const s3 = await getS3Client();
  try {
    const result = await s3.send(new ListBucketsCommand({}));
    return {
      success: true,
      buckets: result?.Buckets ?? [],
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
    };
  }
};
export const listFiles = async (bucketName: string) => {
  const s3 = await getS3Client();
  try {
    const result = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
      })
    );
    const filteredFiles = result?.Contents?.filter(
      (file: any) => !(file.Key.endsWith("/") && file.Size === 0)
    );
    const directories = result?.Contents?.filter(
      (file: any) => file.Key.endsWith("/") && file.Size === 0
    );
    return {
      success: true,
      content: filteredFiles ?? [],
      directories,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
    };
  }
};
export async function deleteBucket(bucketName: string) {
  const s3 = await getS3Client();
  try {
    const listCommand = new ListObjectsV2Command({ Bucket: bucketName });
    const listResult = await s3.send(listCommand);

    if (listResult.Contents && listResult.Contents.length > 0) {
      const deleteCommand = new DeleteObjectsCommand({
        Bucket: bucketName,
        Delete: {
          Objects: listResult.Contents.map((obj) => ({ Key: obj.Key! })),
        },
      });
      await s3.send(deleteCommand);
    }

    // Delete the bucket
    const command = new DeleteBucketCommand({ Bucket: bucketName });
    await s3.send(command);
    revalidatePath("/dasboard");
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
    };
  }
}
export const createBucket = async (
  bucketName: string,
  useKMS: boolean,
  region: string
) => {
  const s3 = await getS3Client();
  try {
    // Step 1: Create the bucket
    const params =
      region === "us-east-1"
        ? { Bucket: bucketName }
        : {
            Bucket: bucketName,
            CreateBucketConfiguration: {
              LocationConstraint: region as BucketLocationConstraint,
            },
          };
    await s3.send(new CreateBucketCommand(params));

    // Step 2: Optionally enable default encryption (KMS)
    if (useKMS) {
      await s3.send(
        new PutBucketEncryptionCommand({
          Bucket: bucketName,
          ServerSideEncryptionConfiguration: {
            Rules: [
              {
                ApplyServerSideEncryptionByDefault: {
                  SSEAlgorithm: "aws:kms",
                  // Optional: specify a custom KMS key
                  // KMSMasterKeyID: "your-kms-key-id",
                },
                BucketKeyEnabled: true,
              },
            ],
          },
        })
      );
    }
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Bucket creation error:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
};
export const uploadFileAction = async (
  file: any,
  kmsKey: string | undefined,
  directory: string,
  bucket: string
) => {
  try {
    const s3 = await getS3Client();
    if (!file) throw new Error("No file uploaded");
    const buffer = Buffer.from(await file.arrayBuffer());
    const commandParams: any = {
      Bucket: bucket,
      Key: directory ? `${directory}/${file.name}` : `${file.name}`,
      Body: buffer,
      ContentType: file.type,
      ServerSideEncryption: "aws:kms", // Always use KMS, let AWS use default unless specified
    };

    if (kmsKey) {
      commandParams.SSEKMSKeyId = kmsKey;
    }

    await s3.send(new PutObjectCommand(commandParams));
    revalidatePath("/bucket");
    return { success: true };
  } catch (error: any) {
    console.error("file creation error:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
};
export async function deleteFileFromS3(bucket: string, key: string) {
  const s3 = await getS3Client();
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    await s3.send(command);
    revalidatePath("/bucket");
    return { success: true };
  } catch (err: any) {
    console.error("S3 delete error:", err);
    return { success: false, error: err.message || "Delete failed" };
  }
}
export async function getPresignedDownloadUrl(bucket: string, key: string) {
  const s3 = await getS3Client();
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ResponseContentDisposition: `attachment; filename=${key}`,
    });

    const url: any = await getSignedUrl(s3, command, { expiresIn: 60 }); // expires in 60 seconds
    return { success: true, url: url };
  } catch (err: any) {
    console.error("Error generating presigned URL:", err);
    return { success: false, error: err.message };
  }
}
