CREATE TYPE "public"."lecture_content_status_enum" AS ENUM('uploading', 'processing', 'completed');--> statement-breakpoint
CREATE TYPE "public"."lectures_resources_type" AS ENUM('video', 'video_slide_mashup', 'article');--> statement-breakpoint
CREATE TABLE "lecture_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lectureId" uuid NOT NULL,
	"content_type" "lecture_content_type" NOT NULL,
	"is_downloadable" boolean DEFAULT false NOT NULL,
	"status" "lecture_content_status_enum" NOT NULL,
	"video_url" text,
	"duration" integer,
	"slide_url" text,
	"article" text
);
--> statement-breakpoint
CREATE TABLE "lectures_resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lectureId" uuid NOT NULL,
	"types" "lecture_content_type",
	"downloadable_file_path" text,
	"externalResource" json[] DEFAULT '{}' NOT NULL,
	"sourec_code_file_path" text
);
--> statement-breakpoint
ALTER TABLE "lecture_content" ADD CONSTRAINT "lecture_content_lectureId_sections_id_fk" FOREIGN KEY ("lectureId") REFERENCES "public"."sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lectures_resources" ADD CONSTRAINT "lectures_resources_lectureId_lectures_id_fk" FOREIGN KEY ("lectureId") REFERENCES "public"."lectures"("id") ON DELETE cascade ON UPDATE no action;