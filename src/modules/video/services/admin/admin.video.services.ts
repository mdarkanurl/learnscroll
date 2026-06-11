import { generateApiSignRequest } from "#cloudinary";
import { env } from "#configs";

export class AdminVideoServices {
    
    async generateSignature(userEmail: string) {
        try {
            const timestamp = Math.round(Date.now() / 1000);
            const publicId = crypto.randomUUID();
            const folder = `courses/${userEmail}`;
            const context = `userEmail=${userEmail}`;

            // Only include fields that Cloudinary actually signs
            const paramsToSign = {
                timestamp: timestamp.toString(),
                folder,
                context,
                public_id: publicId,
            };

            const signature = await generateApiSignRequest(paramsToSign);

            // Return apiKey and cloudName separately — NOT part of the signed params
            return {
                ...paramsToSign,
                publicId,
                signature,
                apiKey: env.cloudinaryApiKey,
                cloudName: env.cloudinaryCloudName,
            };
        } catch (error) {
            throw error;
        }
    }  
}
