import { generateApiSignRequest } from "#cloudinary";
import { env } from "#configs";

export class AdminVideoServices {
    
    async generateSignature(userEmail: string) {
        try {
            const timestamp = Math.round(Date.now() / 1000);

            const paramsToSign = {
                timestamp: timestamp.toString(),
                folder: `courses/${userEmail}`,
                context: `userEmail=${userEmail}`,
                publicId: crypto.randomUUID()
            };

            const signature = await generateApiSignRequest(paramsToSign);

            return {
                ...paramsToSign,
                signature
            }
        } catch (error) {
            throw error;
        }
    }   
}
