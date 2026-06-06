DROP INDEX "userIdIndex_instructors";--> statement-breakpoint
DROP INDEX "userIdIndex_privacy_settings";--> statement-breakpoint
DROP INDEX "userIdIndex_profiles";--> statement-breakpoint
CREATE UNIQUE INDEX "userIdIndex_instructors" ON "instructors" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "userIdIndex_privacy_settings" ON "privacy_settings" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "userIdIndex_profiles" ON "profiles" USING btree ("userId");