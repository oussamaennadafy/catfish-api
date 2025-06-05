ALTER TABLE "rooms" ALTER COLUMN "is_full" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "rooms" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "rooms" DROP COLUMN "members_count";