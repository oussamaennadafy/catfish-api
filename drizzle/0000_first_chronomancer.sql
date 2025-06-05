CREATE TABLE "rooms" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar NOT NULL,
	"members_count" integer DEFAULT 2,
	"is_full" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "waiting_queue" (
	"id" serial PRIMARY KEY NOT NULL,
	"socket_id" varchar NOT NULL,
	"room_type" varchar NOT NULL
);
