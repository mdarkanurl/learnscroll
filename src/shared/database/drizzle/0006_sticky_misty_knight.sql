ALTER TABLE "courses" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "status" SET DEFAULT 'draft'::text;--> statement-breakpoint
DROP TYPE "public"."course_status";--> statement-breakpoint
CREATE TYPE "public"."course_status" AS ENUM('draft', 'published', 'under_review', 'unpublished');--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "status" SET DEFAULT 'draft'::"public"."course_status";--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "status" SET DATA TYPE "public"."course_status" USING "status"::"public"."course_status";