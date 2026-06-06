CREATE TYPE "public"."course_category" AS ENUM('development', 'business', 'finance_and_accounting', 'it_and_software', 'office_productivity', 'personal_development', 'design', 'marketing', 'lifestyle', 'photography_and_video', 'health_and_fitness', 'music', 'teaching_and_academics');--> statement-breakpoint
CREATE TYPE "public"."course_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."course_time_commitment" AS ENUM('very_busy', 'side_project', 'flexible', 'undecided');--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "learning_objectives" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "prerequisites" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "intended_learners" text[] DEFAULT '{}' NOT NULL;