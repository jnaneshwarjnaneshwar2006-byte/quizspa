-- Migration: Synchronize Live Quiz State & Automatic 5-Second Leaderboard Advancement
-- Preserves existing quizzes, questions, participants, answers, and results.
USE `quizspark_db`;

ALTER TABLE `quizzes`
  ADD COLUMN IF NOT EXISTS `leaderboard_start_time` DOUBLE NULL AFTER `question_start_time`,
  ADD COLUMN IF NOT EXISTS `next_question_at` DOUBLE NULL AFTER `leaderboard_start_time`;