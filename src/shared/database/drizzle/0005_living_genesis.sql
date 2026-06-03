DROP INDEX "userIdUniqueIndex";--> statement-breakpoint
CREATE INDEX "userIdIndex" ON "refresh_tokens" USING btree ("userId");