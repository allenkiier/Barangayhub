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

      residence_start_date TEXT,
      admin_status TEXT DEFAULT 'none'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS council (
      council_id INTEGER PRIMARY KEY AUTOINCREMENT,
      userid INTEGER NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      FOREIGN KEY (userid) REFERENCES user(userid)
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
          token,
        });
      });
    }
  );
});

// ===================== SIGNUP =====================
app.post('/api/signup', (req, res) => {
  const { user_name, email_ad, password, isAdmin } = req.body;

  if (!user_name || !email_ad || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  db.get(
    'SELECT 1 FROM user WHERE email_ad = ?',
    [email_ad],
    (err, row) => {
      if (err) return res.status(500).json({ error: 'Database error.' });
      if (row) return res.status(400).json({ error: 'Email already registered.' });

      bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
        if (hashErr) return res.status(500).json({ error: 'Password hashing failed.' });

        let admin_status = 'none';
        let isAdminValue = 0;

        if (isAdmin) {
          admin_status = 'pending';
        }

        db.run(
          `INSERT INTO user (user_name, email_ad, passwordHash, isAdmin, admin_status)
           VALUES (?, ?, ?, ?, ?)`,
          [user_name, email_ad, hashedPassword, isAdminValue, admin_status],
          function (insertErr) {
            if (insertErr) return res.status(500).json({ error: insertErr.message });

            res.status(201).json({
              message: isAdmin
                ? 'Admin request submitted for approval'
                : 'User created successfully',
              userid: this.lastID,
              admin_status
            });
          }
        );
      });
    }
  );
});

// ===================== ADMIN REQUESTS =====================
app.get('/api/admin/requests', (req, res) => {
  db.all(
    `SELECT userid, user_name, email_ad, admin_status
     FROM user
     WHERE admin_status = 'pending'`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.post('/api/admin/approve/:id', (req, res) => {
  const userId = req.params.id;

  db.run(
    `UPDATE user SET isAdmin = 1, admin_status = 'approved' WHERE userid = ?`,
    [userId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      res.json({ message: 'User approved as admin' });
    }
  );
});

app.post('/api/admin/reject/:id', (req, res) => {
  const userId = req.params.id;

  db.run(
    `UPDATE user SET admin_status = 'rejected' WHERE userid = ?`,
    [userId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      res.json({ message: 'Admin request rejected' });
    }
  );
});

// ===================== GET USER =====================
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
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ message: "Profile updated successfully" });
    }
  );
});

// ===================== ADMIN USERS =====================
app.get("/api/users/admins", (req, res) => {
  const query = `
    SELECT userid, user_name, email_ad
    FROM user
    WHERE isAdmin = '1'
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }

    res.json(rows);
  });
});

// ===================== COUNCIL =====================
app.post("/api/council/add", (req, res) => {
  const { userid, name, role, is_active } = req.body;

  if (!userid || !name || !role) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // prevent duplicates
  db.get(`SELECT * FROM council WHERE userid = ?`, [userid], (err, row) => {
    if (row) {
      return res.status(400).json({ error: "User already in council" });
    }

    const query = `
      INSERT INTO council (userid, name, role, is_active)
      VALUES (?, ?, ?, ?)
    `;

    db.run(query, [userid, name, role, is_active], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({
        message: "Council member added successfully",
        council_id: this.lastID,
      });
    });
  });
});

/// 1. GET ALL COUNCIL MEMBERS (Active and Inactive)
// Used by the Management Table to show everyone who has ever been admitted
app.get("/api/council/all", (req, res) => {
  const query = "SELECT * FROM council ORDER BY is_active DESC, role ASC";

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Error fetching all members:", err.message);
      return res.status(500).json({ error: "Failed to fetch council records" });
    }
    res.json(rows);
  });
});

// 2. UPDATE MEMBER STATUS (The "Soft Delete" Toggle)
// Used to switch is_active between 1 and 0
app.put("/api/council/update-status/:id", (req, res) => {
  const { is_active } = req.body; // Expects { is_active: 0 or 1 }
  const { id } = req.params;

  const query = `UPDATE council SET is_active = ? WHERE council_id = ?`;

  db.run(query, [is_active, id], function (err) {
    if (err) {
      console.error("Error updating status:", err.message);
      return res.status(500).json({ error: "Failed to update member status" });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Member not found" });
    }

    res.json({ message: "Status updated successfully", id, is_active });
  });
});

app.get("/api/council/list", (req, res) => {
  const query = "SELECT * FROM council WHERE is_active = 1";

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Initialize our structured object
    const chartData = {
      punongBarangay: null,
      sbMembers: [],
      skChairman: null,
      staff: [] // For Secretary, Treasurer, and Clerk
    };

    rows.forEach((member) => {
      switch (member.role) {
        case "Punong Barangay":
          chartData.punongBarangay = member;
          break;
        case "SB Member":
          chartData.sbMembers.push(member);
          break;
        case "SK Chairman":
          chartData.skChairman = member;
          break;
        case "Barangay Secretary":
        case "Barangay Treasurer":
        case "Barangay Clerk":
          chartData.staff.push(member);
          break;
        default:
          // Optional: handle other roles or ignore
          break;
      }
    });

    res.json(chartData);
  });
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