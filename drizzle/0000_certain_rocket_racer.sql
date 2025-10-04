CREATE TABLE `reviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`movie_id` integer NOT NULL,
	`movie_title` text NOT NULL,
	`movie_poster` text,
	`user_name` text NOT NULL,
	`rating` integer NOT NULL,
	`review_text` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` text NOT NULL,
	`liked_movie_ids` text,
	`preferred_genres` text,
	`search_history` text,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_preferences_session_id_unique` ON `user_preferences` (`session_id`);