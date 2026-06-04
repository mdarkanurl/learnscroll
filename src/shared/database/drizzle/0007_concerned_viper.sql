CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"headline" varchar(60),
	"biography" text,
	"language" varchar(10),
	"website" varchar(255),
	"facebook" varchar(255),
	"instagram" varchar(255),
	"linkedin" varchar(255),
	"tiktok" varchar(255),
	"x" varchar(255),
	"youtube" varchar(255)
);
--> statement-breakpoint
DROP INDEX "userIdIndex";--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "userIdIndex_profiles" ON "profiles" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "userIdIndex_refresh_tokens" ON "refresh_tokens" USING btree ("userId");