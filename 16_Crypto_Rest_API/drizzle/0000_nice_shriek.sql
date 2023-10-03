CREATE TABLE `CoinBase` (
	`id` int AUTO_INCREMENT NOT NULL,
	`crypto_symbol` varchar(256),
	`price` double,
	`last_updated` time,
	CONSTRAINT `CoinBase_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `CoinMarketCap` (
	`id` int AUTO_INCREMENT NOT NULL,
	`crypto_symbol` varchar(256),
	`price` double,
	`last_updated` time,
	CONSTRAINT `CoinMarketCap_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `CoinStats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`crypto_symbol` varchar(256),
	`price` double,
	`last_updated` time,
	CONSTRAINT `CoinStats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `Kucoin` (
	`id` int AUTO_INCREMENT NOT NULL,
	`crypto_symbol` varchar(256),
	`price` double,
	`last_updated` time,
	CONSTRAINT `Kucoin_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `crypto_symbol_idx` ON `CoinBase` (`crypto_symbol`);--> statement-breakpoint
CREATE INDEX `last_updated_idx` ON `CoinBase` (`last_updated`);--> statement-breakpoint
CREATE INDEX `crypto_symbol_idx` ON `CoinMarketCap` (`crypto_symbol`);--> statement-breakpoint
CREATE INDEX `last_updated_idx` ON `CoinMarketCap` (`last_updated`);--> statement-breakpoint
CREATE INDEX `crypto_symbol_idx` ON `CoinStats` (`crypto_symbol`);--> statement-breakpoint
CREATE INDEX `last_updated_idx` ON `CoinStats` (`last_updated`);--> statement-breakpoint
CREATE INDEX `crypto_symbol_idx` ON `Kucoin` (`crypto_symbol`);--> statement-breakpoint
CREATE INDEX `last_updated_idx` ON `Kucoin` (`last_updated`);