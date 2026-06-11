import { v2 as Cloudinary } from 'cloudinary';
import { env } from '#configs';

Cloudinary.config({
  cloud_name: env.cloudinaryCloudName,
  api_key: env.cloudinaryApiKey,
  api_secret: env.cloudinaryApiSecret,
});

export async function uploadImage(buffer: Buffer, folder: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = Cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
}

export async function generateApiSignRequest(payload: Record<string, string>): Promise<string> {
  return Cloudinary.utils.api_sign_request(
    payload,
    env.cloudinaryApiSecret,
  );
}

