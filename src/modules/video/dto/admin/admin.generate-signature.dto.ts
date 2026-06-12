import { z } from "zod";

export const generateSignature = z.object({
    contentType: z.enum(["video", "video_slide_mashup"]), // these two value must be match with lectureContentTypeEnumValue
});

export type GenerateSignatureDto = z.infer<typeof generateSignature>;
