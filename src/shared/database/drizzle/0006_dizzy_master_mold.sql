ALTER TABLE "refresh_tokens" ADD COLUMN "userAgent" text NOT NULL;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD COLUMN "userIp" text NOT NULL;