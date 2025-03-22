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
	"room_type" varchar NOT NULL,
	"user_id" integer
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"photo" varchar(255) DEFAULT 'default.jpg',
	"password" varchar(255) NOT NULL,
	"password_changed_at" timestamp,
	"password_reset_token" varchar(255),
	"password_reset_expires" timestamp,
	"active" boolean DEFAULT true,
	"joined_room" integer,
	"socket_id" varchar,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "waiting_queue" ADD CONSTRAINT "waiting_queue_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_joined_room_rooms_id_fk" FOREIGN KEY ("joined_room") REFERENCES "public"."rooms"("id") ON DELETE no action ON UPDATE no action;