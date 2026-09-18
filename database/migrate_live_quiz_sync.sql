-- Run once against an existing QuizSpark database.
-- Existing questions, users, answers, and quiz data are preserved.
USE `quizspark_db`;

ALTER TABLE `quizzes`
  ADD COLUMN `leaderboard_start_time` DOUBLE NULL AFTER `question_start_time`;