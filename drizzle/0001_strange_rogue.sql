CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`type` enum('исковое_заявление','претензия','договор','другое') NOT NULL,
	`style` enum('формальный','нейтральный','агрессивный','защитный') DEFAULT 'нейтральный',
	`content` text NOT NULL,
	`fileUrl` varchar(512),
	`fileKey` varchar(512),
	`format` enum('pdf','docx','txt') DEFAULT 'pdf',
	`fileSize` bigint,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `uploadedFiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`originalName` varchar(255) NOT NULL,
	`fileKey` varchar(512) NOT NULL,
	`fileUrl` varchar(512) NOT NULL,
	`mimeType` varchar(100),
	`fileSize` bigint NOT NULL,
	`description` text,
	`isPublic` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `uploadedFiles_id` PRIMARY KEY(`id`)
);
