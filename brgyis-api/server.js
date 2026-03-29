const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 3001;
const SECRET_KEY = "secretkey";

app.use(cors());
app.use(express.json());

const DB_PATH = path.resolve(__dirname, 'is.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('DB connection error:', err.message);
    process.exit(1);
  } else {
    console.log('Database connected successfully');
  }
});

db.run(`PRAGMA foreign_keys = ON`);

// ===================== TABLES =====================
db.serialize(() => {

  db.run(`
    CREATE TABLE IF NOT EXISTS user (
      userid INTEGER PRIMARY KEY AUTOINCREMENT,
      user_name TEXT NOT NULL,
      passwordHash TEXT NOT NULL,
      isAdmin INTEGER NOT NULL DEFAULT 0,
      email_ad TEXT UNIQUE NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS council (
      council_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      is_active INTEGER DEFAULT 1
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      trans_id INTEGER PRIMARY KEY AUTOINCREMENT,
      trans_name TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS request (
      req_id INTEGER PRIMARY KEY AUTOINCREMENT,
      trans_id INTEGER NOT NULL,
      secretary_id INTEGER,
      captain_id INTEGER,
      status TEXT DEFAULT 'pending',
      secretary_signed_at TEXT,
      captain_approved_at TEXT,
      FOREIGN KEY (trans_id) REFERENCES transactions(trans_id),
      FOREIGN KEY (secretary_id) REFERENCES council(council_id),
      FOREIGN KEY (captain_id) REFERENCES council(council_id)
    )
  `);

});

// ===================== LOGIN =====================
app.post("/api/login", (req, res) => {
  const { email_ad, password, isAdmin } = req.body;

  db.get(
    "SELECT * FROM user WHERE email_ad = ?",
    [email_ad],
    (err, user) => {
      if (err) return res.status(500).json({ error: err.message });

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials." });
      }

      bcrypt.compare(password, user.passwordHash, (cmpErr, match) => {
        if (cmpErr) return res.status(500).json({ error: cmpErr.message });

        if (!match) {
          return res.status(401).json({ error: "Invalid credentials." });
        }

        if (isAdmin && user.isAdmin !== 1) {
          return res.status(403).json({ error: "Not an admin." });
        }

        if (!isAdmin && user.isAdmin === 1) {
          return res.status(403).json({ error: "Login as admin." });
        }

        const token = jwt.sign(
          { userid: user.userid, isAdmin: user.isAdmin },
          SECRET_KEY,
          { expiresIn: "2h" }
        );

        res.json({
          userid: user.userid,
          isAdmin: user.isAdmin === 1,
          token
        });
      });
    }
  );
});

// ===================== GET USER =====================
app.get('/api/user/:userid', (req, res) => {
  const userid = parseInt(req.params.userid, 10);

  db.get(
    `SELECT user_name FROM user WHERE userid = ?`,
    [userid],
    (err, row) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Server error' });
      }

      if (!row) {
        console.log("NO USER FOUND for ID:", userid);
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        username: row.user_name
      });
    }
  );
});

// ===================== TRANSACTIONS =====================
app.get('/api/transactions', (req, res) => {
  db.all('SELECT * FROM transactions', [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

// ===================== START SERVER =====================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});