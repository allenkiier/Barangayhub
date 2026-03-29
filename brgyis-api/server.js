const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database path
const DB_PATH = path.resolve(__dirname, 'is.db');

// Connect to SQLite database
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    process.exit(1); // Stop server if DB fails
  } else {
    console.log('Database connected successfully');
  }
});

// Enable foreign keys
db.run(`PRAGMA foreign_keys = ON`);

// Create tables if they don't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS barangay (
      brgy_num INTEGER PRIMARY KEY AUTOINCREMENT,
      brgy_name TEXT,
      brgy_cpt TEXT,
      brgy_sec TEXT
    )
  `, (err) => {
    if (err) console.error("Error creating barangay table:", err.message);
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS user (
      userid INTEGER PRIMARY KEY AUTOINCREMENT,
      created DATETIME DEFAULT CURRENT_TIMESTAMP,
      user_name TEXT NOT NULL,
      passwordHash TEXT NOT NULL,
      isAdmin INTEGER NOT NULL DEFAULT 0,
      sex TEXT,
      civil_status TEXT,
      birthdate DATE,
      mother_name TEXT,
      father_name TEXT,
      house_num TEXT,
      street TEXT,
      barangay TEXT,
      municipality TEXT,
      zip_code TEXT,
      province TEXT,
      country TEXT,
      email_ad TEXT UNIQUE NOT NULL,
      contact_num TEXT,
      brgy_num INTEGER,
      FOREIGN KEY (brgy_num) REFERENCES barangay(brgy_num)
    )
  `, (err) => {
    if (err) console.error("Error creating user table:", err.message);
  });
});

db.run(`
  CREATE TABLE IF NOT EXISTS admin_requests (
    request_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT NOT NULL,
    email_ad TEXT NOT NULL,
    passwordHash TEXT NOT NULL,
    request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending'
  );
`)

// =====================
// SIGNUP ENDPOINT
// =====================
app.post('/api/signup', (req, res) => {
  const { user_name, email_ad, password, isAdmin } = req.body;

  if (!user_name || !email_ad || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  // Check if email exists in either table
  db.get(
    'SELECT 1 FROM user WHERE email_ad = ? UNION SELECT 1 FROM admin_requests WHERE email_ad = ?',
    [email_ad, email_ad],
    (err, row) => {
      if (err) return res.status(500).json({ error: 'Database error.' });
      if (row) return res.status(400).json({ error: 'Email already registered or pending approval.' });

      // Hash password
      bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
        if (hashErr) return res.status(500).json({ error: 'Password hashing failed.' });

        if (isAdmin) {
          // Insert into admin_requests
          db.run(
            `INSERT INTO admin_requests (user_name, email_ad, passwordHash) VALUES (?, ?, ?)`,
            [user_name, email_ad, hashedPassword],
            function (insertErr) {
              if (insertErr) return res.status(500).json({ error: insertErr.message });
              return res.status(201).json({
                message: 'Admin request submitted for approval',
                request_id: this.lastID,
              });
            }
          );
        } else {
          // Insert directly into user
          db.run(
            `INSERT INTO user (user_name, email_ad, passwordHash, isAdmin) VALUES (?, ?, ?, 0)`,
            [user_name, email_ad, hashedPassword],
            function (insertErr) {
              if (insertErr) return res.status(500).json({ error: insertErr.message });
              return res.status(201).json({
                message: 'User created successfully',
                userid: this.lastID,
              });
            }
          );
        }
      });
    }
  );
});

const jwt = require("jsonwebtoken");
const SECRET_KEY = "secretkey";

app.post("/api/login", (req, res) => {
  const { email_ad, password, isAdmin } = req.body;

  if (!email_ad || !password) {
    return res.status(400).json({ error: "Email and password required." });
  }

  db.get("SELECT * FROM user WHERE email_ad = ?", [email_ad], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    bcrypt.compare(password, user.passwordHash, (cmpErr, match) => {
      if (cmpErr) return res.status(500).json({ error: cmpErr.message });

      if (!match) {
        return res.status(401).json({ error: "Invalid credentials." });
      }

      // 🔴 IMPORTANT: Validate admin checkbox vs actual role
      if (isAdmin && user.isAdmin !== 1) {
        return res.status(403).json({
          error: "You are not registered as admin.",
        });
      }

      if (!isAdmin && user.isAdmin === 1) {
        return res.status(403).json({
          error: "Please login as admin.",
        });
      }

      // ✅ Create token
      const token = jwt.sign(
        {
          userid: user.userid,
          isAdmin: user.isAdmin,
        },
        SECRET_KEY,
        { expiresIn: "2h" }
      );

      return res.json({
        message: "Login successful",
        userid: user.userid,
        isAdmin: user.isAdmin === 1,
        token,
      });
    });
  });
});

// =====================
// START SERVER
// =====================
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});