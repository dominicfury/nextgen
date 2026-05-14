CREATE TABLE `admin_login_tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` integer NOT NULL,
	`used_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `admin_login_tokens_hash_idx` ON `admin_login_tokens` (`token_hash`);--> statement-breakpoint
CREATE INDEX `admin_login_tokens_email_idx` ON `admin_login_tokens` (`email`);--> statement-breakpoint
CREATE TABLE `admin_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`admin_id` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `admin_sessions_admin_idx` ON `admin_sessions` (`admin_id`);--> statement-breakpoint
CREATE TABLE `admins` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`role` text DEFAULT 'admin' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admins_email_unique` ON `admins` (`email`);--> statement-breakpoint
CREATE TABLE `download_grants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`customer_email` text NOT NULL,
	`token` text NOT NULL,
	`download_count` integer DEFAULT 0 NOT NULL,
	`max_downloads` integer,
	`expires_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `download_grants_token_unique` ON `download_grants` (`token`);--> statement-breakpoint
CREATE INDEX `download_grants_order_idx` ON `download_grants` (`order_id`);--> statement-breakpoint
CREATE INDEX `download_grants_email_idx` ON `download_grants` (`customer_email`);--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`price_at_purchase_cents` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `order_items_order_idx` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`customer_email` text NOT NULL,
	`stripe_session_id` text NOT NULL,
	`stripe_payment_intent_id` text,
	`total_cents` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_stripe_session_unique` ON `orders` (`stripe_session_id`);--> statement-breakpoint
CREATE INDEX `orders_email_idx` ON `orders` (`customer_email`);--> statement-breakpoint
CREATE TABLE `product_files` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`storage_key` text NOT NULL,
	`original_filename` text DEFAULT '' NOT NULL,
	`file_size` integer DEFAULT 0 NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`uploaded_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `product_files_product_idx` ON `product_files` (`product_id`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`price_cents` integer NOT NULL,
	`vehicle_make` text DEFAULT '' NOT NULL,
	`vehicle_model` text DEFAULT '' NOT NULL,
	`engine` text DEFAULT '' NOT NULL,
	`tuning_stage` text DEFAULT '' NOT NULL,
	`file_format` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_slug_unique` ON `products` (`slug`);--> statement-breakpoint
CREATE INDEX `products_status_idx` ON `products` (`status`);--> statement-breakpoint
CREATE INDEX `products_make_idx` ON `products` (`vehicle_make`);