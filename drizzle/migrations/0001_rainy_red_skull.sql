CREATE TABLE `consultation_requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`vehicle_make` text DEFAULT '' NOT NULL,
	`vehicle_model` text DEFAULT '' NOT NULL,
	`vehicle_year` text DEFAULT '' NOT NULL,
	`engine` text DEFAULT '' NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `consultation_requests_status_idx` ON `consultation_requests` (`status`);--> statement-breakpoint
CREATE INDEX `consultation_requests_created_idx` ON `consultation_requests` (`created_at`);