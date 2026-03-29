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
      email_ad TEXT UNIQUE NOT NULL,

      civil_status TEXT,
      contact_no TEXT,
      isPWD INTEGER DEFAULT 0,
      isSenior INTEGER DEFAULT 0,
      barangay_id TEXT,
      national_id TEXT,

      house_no TEXT,
      street TEXT,
      barangay TEXT,
      municipality TEXT,
      zip_code TEXT,
      province TEXT,

      residence_start_date TEXT
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

        // Admin checks
        if (isAdmin && user.isAdmin !== 1) {
          return res.status(403).json({ error: "Not an admin." });
        }

        if (!isAdmin && user.isAdmin === 1) {
          return res.status(403).json({ error: "Login as admin." });
        }

        // Generate token
        const token = jwt.sign(
          { userid: user.userid, isAdmin: user.isAdmin },
          SECRET_KEY,
          { expiresIn: "2h" }
        );

        res.json({
          userid: user.userid,
          isAdmin: user.isAdmin === 1,
          token,
        });
      });
    }
  );
});

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

// ===================== GET USER (FULL DATA) =====================
app.get('/api/user/:userid', (req, res) => {
  const userid = parseInt(req.params.userid, 10);

  db.get(
    `SELECT * FROM user WHERE userid = ?`,
    [userid],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });

      if (!row) return res.status(404).json({ error: "User not found" });

      res.json(row);
    }
  );
});

// ===================== UPDATE PROFILE =====================
app.put("/api/user/:userid/profile", (req, res) => {
  console.log("✅ PROFILE UPDATE HIT");

  const userid = req.params.userid;

  const {
    user_name,
    email_ad,
    civil_status,
    contact_no,
    isPWD,
    isSenior,
    barangay_id,
    national_id,
    house_no,
    street,
    barangay,
    municipality,
    zip_code,
    province,
    residence_start_date
  } = req.body;

  const sql = `
    UPDATE user SET
      user_name = ?,
      email_ad = ?,
      civil_status = ?,
      contact_no = ?,
      isPWD = ?,
      isSenior = ?,
      barangay_id = ?,
      national_id = ?,
      house_no = ?,
      street = ?,
      barangay = ?,
      municipality = ?,
      zip_code = ?,
      province = ?,
      residence_start_date = ?
    WHERE userid = ?
  `;

  db.run(
    sql,
    [
      user_name,
      email_ad,
      civil_status,
      contact_no,
      isPWD,
      isSenior,
      barangay_id,
      national_id,
      house_no,
      street,
      barangay,
      municipality,
      zip_code,
      province,
      residence_start_date,
      userid
    ],
    function (err) {
      if (err) {
        console.error("DB ERROR:", err.message);
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ message: "Profile updated successfully" });
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