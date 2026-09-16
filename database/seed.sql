-- Seed Data for QuizSpark Live Quiz Application
USE `quizspark_db`;

-- Clear existing seed data if needed
DELETE FROM `teachers` WHERE `email` IN ('teacher@quizspark.com', 'jnanesh2006@gmail.com');

-- Insert Demo Teacher (Email: jnanesh2006@gmail.com, Password: 123456)
INSERT INTO `teachers` (`id`, `name`, `email`, `password_hash`, `created_at`) 
VALUES (1, 'Jnaneshwar B A', 'jnanesh2006@gmail.com', '$2y$10$hwmzy9p5OMBsbiHs2rOoaOA1Q.sqoaTDlZZSO/fYq8b9cd3BPGGNa', NOW());

-- Insert Demo Quiz
INSERT INTO `quizzes` (`id`, `teacher_id`, `title`, `description`, `category`, `status`, `created_at`) 
VALUES (1, 1, 'Java & Web Development Fundamentals', 'A fun live quiz testing core concepts of Java, HTTP, HTML, and web architecture!', 'Computer Science', 'draft', NOW());

-- Insert 6 Demo Questions for Quiz #1 (including True/False)
INSERT INTO `questions` (`quiz_id`, `question_number`, `question_type`, `question_text`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_option`, `time_limit`) VALUES
(1, 1, 'multiple_choice', 'What does JVM stand for in Java?', 'Java Visual Machine', 'Java Virtual Machine', 'Java Variable Method', 'Java Virtual Memory', 'B', 10),
(1, 2, 'multiple_choice', 'Which HTML tag is used to create a hyperlink?', '<link>', '<a>', '<href>', '<url>', 'B', 10),
(1, 3, 'multiple_choice', 'Which HTTP status code represents "Not Found"?', '200', '403', '404', '500', 'C', 10),
(1, 4, 'multiple_choice', 'What keyword is used to declare a constant in modern JavaScript?', 'var', 'let', 'const', 'define', 'C', 10),
(1, 5, 'multiple_choice', 'Which MySQL clause is used to filter records based on a condition?', 'ORDER BY', 'GROUP BY', 'WHERE', 'HAVING', 'C', 10),
(1, 6, 'true_false', 'Is JavaScript single-threaded?', 'True', 'False', NULL, NULL, 'A', 10);
