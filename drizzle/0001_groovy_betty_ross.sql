ALTER TABLE "waiting_queue" ADD COLUMN "userId" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "waiting_queue" DROP COLUMN "socket_id";