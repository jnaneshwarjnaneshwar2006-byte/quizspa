# fahh- Full-Stack Kahoot-Style Real-Time Live Quiz Website

**fahh** is a modern, responsive, real-time live quiz application similar to Kahoot, built strictly with **HTML5, Vanilla CSS3, Vanilla JavaScript, PHP 8+, and MySQL**.

---

## 🌟 Key Features

- **Multiple Question Types (Kahoot-Style)**: Supports both **Multiple Choice (4 options)** and **True or False (2 choices: Blue Diamond ◆ True, Red Triangle ▲ False)**.
- **Question Image Uploads**: Teachers can upload images (JPG, PNG, WebP, GIF) or drag-and-drop to questions, which display centrally during live games.
- **Single Authentication System**: Only Teachers register/log in. Students join instantly via a 6-digit Join Code or QR Code without creating accounts.
- **Dynamic QR & Join Code Generation**: Automatically generates a unique 6-digit PIN, dynamic join URL, and QR code when a quiz is published.
- **Real-Time Polling Engine**: Optimized JavaScript polling (~1s interval) with single-flight control and debouncing to prevent duplicate requests and memory leaks.
- **Server-Side Scoring & Timing**: Kahoot-style speed bonus algorithm (up to 1000 points) calculated strictly on the server based on high-precision microtime timestamps.
- **Live Leaderboard & Podium**: Displays animated 🥇🥈🥉 podiums, rank movements, student accuracy stats, and CSV export functionality for teachers.
- **Responsive Design**: Flawlessly adapts across Mobile, Tablet, Laptop, and Desktop screens with vibrant dark-mode glassmorphism styling.

---

## 📁 Complete Project Structure

```
c:/Users/Jnaneshwar B A/OneDrive/project/q1/
├── index.php
├── config/
│   ├── database.php        # PDO database connection & constants
│   ├── session.php         # PHP session management & dynamic Base URL
│   └── security.php        # CSRF, XSS sanitization, JSON response helpers
├── database/
│   ├── schema.sql          # Full MySQL database table schema
│   ├── seed.sql            # Demo teacher account & sample quiz data
│   └── init_db.php         # Database setup CLI script
├── teacher/
│   ├── login.php           # Teacher login page
│   ├── dashboard.php       # Teacher dashboard & metrics
│   ├── create_quiz.php     # Dynamic question builder form
│   ├── edit_quiz.php       # Edit quiz & questions
│   ├── quizzes.php        # Teacher quiz library
│   ├── publish.php        # Join code, QR code & URL display
│   ├── live_lobby.php     # Teacher live waiting lobby with live player list
│   ├── live_quiz.php      # Live game control panel & real-time answer stats
│   ├── results.php        # Completed quiz results & CSV exporter
│   └── logout.php         # Logout session handler
├── student/
│   ├── join.php            # Code entry, name & emoji avatar selection
│   ├── lobby.php           # Student waiting room
│   ├── play.php            # 4-option answer buttons with 10s timer
│   ├── leaderboard.php     # Live leaderboard & rank position
│   └── final.php           # Final podium & personal summary
├── api/
│   ├── auth/ (login.php, logout.php)
│   ├── quiz/ (create.php, update.php, publish.php, delete.php, list.php)
│   ├── live/ (get_lobby.php, start_quiz.php, get_state.php, next_question.php, end_question.php, end_quiz.php)
│   └── student/ (join.php, state.php, answer.php, leaderboard.php)
├── assets/
│   ├── css/ (style.css, auth.css, dashboard.css, lobby.css, quiz.css, leaderboard.css)
│   └── js/  (auth.js, dashboard.js, lobby.js, quiz.js, leaderboard.js)
├── uploads/                # Question image uploads directory
└── README.md
```

---

## ⚙️ Installation & Setup Guide

### 1. Requirements
- **PHP**: PHP 8.0 or higher (with `pdo_mysql` enabled)
- **Database**: MySQL 5.7+ or MariaDB (via XAMPP, WAMP, or standalone)
- **Web Server**: Apache or built-in PHP development server

### 2. Database Initialization
1. Ensure MySQL is running on `127.0.0.1:3306`.
2. Run the automated database initializer script via terminal:
   ```bash
   php database/init_db.php
   ```
   *Or manually import `database/schema.sql` and `database/seed.sql` into MySQL.*

If QuizSpark is already installed, run `database/migrate_question_media.sql` once instead of re-running the initializer. This adds Image and Music question support without deleting existing quiz data.

### 3. Running Locally with PHP Built-in Server
Execute the following command in the project root:
```bash
php -S 127.0.0.1:8000
```

Now open your browser and navigate to:
- **Homepage**: `http://127.0.0.1:8000/`
- **Teacher Login**: `http://127.0.0.1:8000/teacher/login.php`
- **Student Join**: `http://127.0.0.1:8000/student/join.php`

---

## 🔑 Teacher Account Credentials

- **Email**: `teacher@quizspark.com`
- **Password**: `password123`

---

## 🎮 How to Test the Complete End-to-End Flow

1. **Log in as Teacher**:
   - Go to `http://127.0.0.1:8000/teacher/login.php`.
   - Login using `teacher@quizspark.com` / `password123`.

2. **Publish or Create a Quiz**:
   - Go to **My Quizzes** and click **Publish** on the demo quiz, or click **Create Quiz** to add custom questions.
   - Click **Open Live Lobby**. Note the **6-digit Join Code** (e.g. `482731`).

3. **Join as Students**:
   - Open a new browser tab, private window, or mobile phone.
   - Navigate to `http://127.0.0.1:8000/student/join.php?code=482731`.
   - Enter a display name (e.g., "Jnaneshwar") and pick an emoji. Click **Join Quiz**.
   - Notice that the **Teacher Live Lobby** automatically updates within ~1s showing the new student card and counter!

4. **Host & Play Live Session**:
   - Teacher clicks **Start Quiz**.
   - Question 1 appears simultaneously on all student screens with a 10-second timer.
   - Students tap an answer option. Answer buttons disable immediately and submit answer to the server.
   - Teacher sees live answer distribution statistics (A: x, B: y, C: z, D: w).
   - When the 10s timer ends, student & teacher views transition to the **Leaderboard**.
   - Teacher clicks **Next Question** to proceed through all questions.
   - Upon completion, the **Final Podium (🥇🥈🥉)** is displayed!
