CREATE TABLE `UrlsStorage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`real_url` text NOT NULL,
	`url_hash` varchar(64) NOT NULL,
	`number_in_group` int NOT NULL,
	CONSTRAINT `UrlsStorage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `url_hash_index` ON `UrlsStorage` (`url_hash`);