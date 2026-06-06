ALTER TABLE "instructors" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "instructors" ADD COLUMN "updatedAt" timestamp;--> statement-breakpoint
ALTER TABLE "privacy_settings" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "privacy_settings" ADD COLUMN "updatedAt" timestamp;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "updatedAt" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updatedAt" timestamp;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "updated_at";