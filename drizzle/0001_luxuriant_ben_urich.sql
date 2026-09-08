CREATE TABLE `career_step` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`position` text NOT NULL,
	`description` text NOT NULL,
	`technologies` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `career_step_userId_idx` ON `career_step` (`user_id`);