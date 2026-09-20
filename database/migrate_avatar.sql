-- Migration: QuizSpark 3D Full-Body Avatar System
-- Adds avatar_data column to participants table while preserving existing records.
USE `quizspark_db`;

ALTER TABLE `participants`
  ADD COLUMN IF NOT EXISTS `avatar_data` TEXT NULL AFTER `emoji`;
