-- Run once against an existing QuizSpark database.
-- Existing questions and data are preserved.
USE `quizspark_db`;

ALTER TABLE `questions`
  MODIFY `question_type` ENUM('multiple_choice', 'true_false', 'image', 'music') DEFAULT 'multiple_choice',
  ADD COLUMN `audio_url` VARCHAR(500) NULL AFTER `image_url`;
