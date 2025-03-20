CREATE TABLE "rooms" (
	"id" serial NOT NULL,
	"type" varchar,
	"members_count" integer DEFAULT 1,
	"is_full" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "waiting_queue" (
	"id" serial NOT NULL,
	"user_id" integer,
	"room_type" varchar
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial NOT NULL,
	"name" varchar,
	"picture" integer
);
