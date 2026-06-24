import { generateApiSignRequest } from "#cloudinary";
import { env } from "#configs";
import type { GenerateSignatureDto } from "../../dto/admin/admin.generate-signature.dto";

export class AdminVideoServices {
    
    async generateSignature(userId: string, data: GenerateSignatureDto) {
        try {
            const timestamp = Math.round(Date.now() / 1000);
            const publicId = crypto.randomUUID();
            const folder = `courses/${userId}`;
            const context = {
                userId,
                data: data.contentType,
            };

            const paramsToSign = {
                timestamp: timestamp.toString(),
                folder,
                context: JSON.stringify(context),
                public_id: publicId,
            };

            const signature = await generateApiSignRequest(paramsToSign);

            return {
                ...paramsToSign,
                signature,
                apiKey: env.cloudinaryApiKey,
                cloudName: env.cloudinaryCloudName,
            };
        } catch (error) {
            throw error;
        }
    }
    
    async webhook(data: any) {
        try {
            // send the data to queue
        } catch (error) {
            throw error;
        }
    }
}
