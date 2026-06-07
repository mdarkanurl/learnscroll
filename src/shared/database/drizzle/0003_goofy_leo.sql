CREATE TYPE "public"."lecture_content_type" AS ENUM('video', 'video_slide_mashup', 'article');--> statement-breakpoint
CREATE TABLE "lectures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sectionId" uuid NOT NULL,
	"title" text NOT NULL,
	"order" integer NOT NULL,
	"is_downloadable" boolean DEFAULT true NOT NULL,
	"description" text,
	"resources" text,
	"content_type" "lecture_content_type" NOT NULL,
	"video_url" text,
	"duration" integer,
	"slide_url" text,
	"article" text
);
--> statement-breakpoint
ALTER TABLE "lectures" ADD CONSTRAINT "lectures_sectionId_sections_id_fk" FOREIGN KEY ("sectionId") REFERENCES "public"."sections"("id") ON DELETE cascade ON UPDATE no action;