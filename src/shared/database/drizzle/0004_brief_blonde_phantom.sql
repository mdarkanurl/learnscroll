ALTER TABLE "courses" DROP CONSTRAINT "courses_instructorId_instructors_id_fk";
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "ownerId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "instructors" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "enrollment_privacy" "enrollment_privacy" DEFAULT 'public' NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "password" text;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_ownerId_instructors_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."instructors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" DROP COLUMN "instructorId";