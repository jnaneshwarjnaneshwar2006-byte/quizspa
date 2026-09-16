-- Database Schema for QuizSpark Live Quiz Application
CREATE DATABASE IF NOT EXISTS `quizspark_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `quizspark_db`;

-- Drop tables if they exist (for clean installation)
DROP TABLE IF EXISTS `quiz_results`;
DROP TABLE IF EXISTS `answers`;
DROP TABLE IF EXISTS `participants`;
DROP TABLE IF EXISTS `questions`;
DROP TABLE IF EXISTS `quizzes`;
DROP TABLE IF EXISTS `teachers`;

-- Teachers Table
CREATE TABLE `teachers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quizzes Table
CREATE TABLE `quizzes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `teacher_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `category` VARCHAR(100) DEFAULT 'General',
  `join_code` VARCHAR(6) NULL UNIQUE,
  `join_url` VARCHAR(500) NULL,
  `qr_data` TEXT NULL,
  `status` ENUM('draft', 'published', 'lobby', 'running', 'completed') DEFAULT 'draft',
  `current_question` INT DEFAULT 0,
  `current_question_status` ENUM('inactive', 'active', 'ended', 'leaderboard') DEFAULT 'inactive',
  `question_start_time` DOUBLE NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `published_at` DATETIME NULL,
  `started_at` DATETIME NULL,
  `ended_at` DATETIME NULL,
  FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Questions Table
CREATE TABLE `questions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `quiz_id` INT NOT NULL,
  `question_number` INT NOT NULL,
  `question_type` ENUM('multiple_choice', 'true_false', 'image', 'music') DEFAULT 'multiple_choice',
  `question_text` TEXT NOT NULL,
  `option_a` VARCHAR(255) NOT NULL,
  `option_b` VARCHAR(255) NOT NULL,
  `option_c` VARCHAR(255) NULL,
  `option_d` VARCHAR(255) NULL,
  `correct_option` ENUM('A', 'B', 'C', 'D') NOT NULL,
  `image_url` VARCHAR(500) NULL,
  `audio_url` VARCHAR(500) NULL,
  `time_limit` INT DEFAULT 10,
  FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE,
  INDEX (`quiz_id`, `question_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Participants Table
CREATE TABLE `participants` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `quiz_id` INT NOT NULL,
  `session_token` VARCHAR(64) NOT NULL UNIQUE,
  `name` VARCHAR(50) NOT NULL,
  `emoji` VARCHAR(20) DEFAULT '😀',
  `total_score` INT DEFAULT 0,
  `total_time` DOUBLE DEFAULT 0,
  `joined_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `last_seen` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` ENUM('joined', 'playing', 'completed') DEFAULT 'joined',
  FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE,
  INDEX (`quiz_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Answers Table
CREATE TABLE `answers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `quiz_id` INT NOT NULL,
  `question_id` INT NOT NULL,
  `participant_id` INT NOT NULL,
  `selected_option` ENUM('A', 'B', 'C', 'D') NULL,
  `is_correct` TINYINT(1) DEFAULT 0,
  `response_time` DOUBLE DEFAULT 0,
  `time_taken` DOUBLE DEFAULT 0,
  `points` INT DEFAULT 0,
  `answered_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`participant_id`) REFERENCES `participants`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_answer` (`question_id`, `participant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quiz Results Table
CREATE TABLE `quiz_results` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `quiz_id` INT NOT NULL,
  `participant_id` INT NOT NULL,
  `rank` INT NOT NULL,
  `total_score` INT NOT NULL,
  `total_time` DOUBLE NOT NULL,
  `correct_answers` INT DEFAULT 0,
  `total_questions` INT DEFAULT 0,
  `completed_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`participant_id`) REFERENCES `participants`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
