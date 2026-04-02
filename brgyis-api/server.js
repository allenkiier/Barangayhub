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
      sex TEXT,
      birthdate TEXT,
      birthplace TEXT,
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
      CREATE TABLE IF NOT EXISTS indig_req (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_id TEXT UNIQUE, 
        userid INTEGER,

        user_name TEXT,
        sex TEXT,
        civil_status TEXT,
        birthdate TEXT, 
        house_no TEXT,
        street TEXT,
        barangay TEXT,
        municipality TEXT,
        province TEXT,

        date_issued TEXT, 
        FOREIGN KEY (userid) REFERENCES user(userid)
      );
    `)

  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      trans_id INTEGER PRIMARY KEY AUTOINCREMENT,
      trans_name TEXT NOT NULL
    )
  `);

    db.run(`
      CREATE TABLE IF NOT EXISTS request (
        req_id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_id TEXT NOT NULL,
        trans_id INTEGER NOT NULL,
        userid INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TEXT DEFAULT (DATETIME('now')),

        FOREIGN KEY (trans_id) REFERENCES transactions(trans_id),
        FOREIGN KEY (userid) REFERENCES user(userid)
      );
    `)

    db.run(`
      CREATE TABLE IF NOT EXISTS brgyid_req (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_id TEXT UNIQUE,
        userid INTEGER,
        user_name TEXT,

        house_no TEXT,
        street TEXT,
        barangay TEXT,
        municipality TEXT,
        province TEXT,

        birthdate TEXT,
        birthplace TEXT,
        sex TEXT,

        weight TEXT,
        height TEXT,
        blood_type TEXT,
        contact_person TEXT,
        contact_person_no TEXT,

        created_at TEXT DEFAULT (DATETIME('now')),

        FOREIGN KEY (userid) REFERENCES user(userid)
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS brgy_clearance_req (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_id TEXT UNIQUE,
        userid INTEGER,

        user_name TEXT,
        address TEXT,
        age INTEGER,
        sex TEXT,
        civil_status TEXT,
        birthdate TEXT,
        birthplace TEXT,

        purpose TEXT,
        created_at TEXT,

        FOREIGN KEY (userid) REFERENCES user(userid)
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS business_clearance_req (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_id TEXT UNIQUE,
        userid INTEGER,

        user_name TEXT,
        trade_name TEXT,
        business_address TEXT,

        created_at TEXT,

        FOREIGN KEY (userid) REFERENCES user(userid)
      );
    `);
});

// ===================== HELPERS =====================
const calculateAge = (birthdate) => {
  if (!birthdate) return '';
  const today = new Date();
  const birthDate = new Date(birthdate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

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
    sex,
    birthdate,
    birthplace,
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
      sex = ?,                 
      birthdate = ?,          
      birthplace = ?,          
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
      sex,                 
      birthdate,           
      birthplace,         
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
        console.error("Update error:", err.message);
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
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ===================== COUNCIL =====================
app.post("/api/council/add", (req, res) => {
  const { userid, name, role, is_active } = req.body;

  if (!userid || !name || !role) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  db.get(`SELECT * FROM council WHERE userid = ?`, [userid], (err, row) => {
    if (row) {
      return res.status(400).json({ error: "User already in council" });
    }

    const query = `
      INSERT INTO council (userid, name, role, is_active)
      VALUES (?, ?, ?, ?)
    `;

    db.run(query, [userid, name, role, is_active], function (err) {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        message: "Council member added successfully",
        council_id: this.lastID,
      });
    });
  });
});

app.get("/api/council/all", (req, res) => {
  const query = "SELECT * FROM council ORDER BY is_active DESC, role ASC";

  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Failed to fetch council records" });
    res.json(rows);
  });
});

app.put("/api/council/update-status/:id", (req, res) => {
  const { is_active } = req.body;
  const { id } = req.params;

  const query = `UPDATE council SET is_active = ? WHERE council_id = ?`;

  db.run(query, [is_active, id], function (err) {
    if (err) return res.status(500).json({ error: "Failed to update member status" });

    if (this.changes === 0) {
      return res.status(404).json({ error: "Member not found" });
    }

    res.json({ message: "Status updated successfully", id, is_active });
  });
});

app.get("/api/council/list", (req, res) => {
  const query = "SELECT * FROM council WHERE is_active = 1";

  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const chartData = {
      punongBarangay: null,
      sbMembers: [],
      skChairman: null,
      staff: []
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
      }
    });

    res.json(chartData);
  });
});

app.get('/api/user/:userid/form-indigency', (req, res) => {
  const userid = parseInt(req.params.userid, 10);

  db.get(
    `SELECT user_name, civil_status, sex, house_no, street, barangay, municipality, province, birthdate
     FROM user WHERE userid = ?`,
    [userid],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: "User not found" });

      res.json({
        name: row.user_name,
        civilStatus: row.civil_status,
        sex: row.sex,
        house_no: row.house_no,
        street: row.street,
        barangay: row.barangay,
        municipality: row.municipality,
        province: row.province,
        age: calculateAge(row.birthdate)
      });
    }
  );
});

app.post('/api/indigency/submit', (req, res) => {
  const { userid } = req.body;

  if (!userid) return res.status(400).json({ error: "User ID required" });

  db.get(`SELECT * FROM user WHERE userid = ?`, [userid], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: "User not found" });

    const transaction_id = `IND-${Date.now()}`;
    const trans_id = 1;

    // Generate a readable date (e.g., "April 1, 2026")
    const date_issued = new Intl.DateTimeFormat('en-PH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date());

    db.run(
      `INSERT INTO indig_req (
        transaction_id, userid, user_name, birthdate, sex, civil_status,
        house_no, street, barangay, municipality, province, date_issued
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
      [
        transaction_id,
        userid,
        user.user_name,
        user.birthdate, // <--- Add this from the user object
        user.sex,
        user.civil_status,
        user.house_no,
        user.street,
        user.barangay,
        user.municipality,
        user.province,
        date_issued
      ],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });

        db.run(
          `INSERT INTO request (transaction_id, trans_id, userid, status)
           VALUES (?, ?, ?, 'pending')`,
          [transaction_id, trans_id, userid],
          function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Request submitted successfully", transaction_id });
          }
        );
      }
    );
  });
});

// ===================== UPDATE REQUEST STATUS =====================
app.put('/api/requests/:req_id/status', (req, res) => {
  const { req_id } = req.params;
  const { status } = req.body;

  const sql = `UPDATE request SET status = ? WHERE req_id = ?`;

  db.run(sql, [status, req_id], function (err) {
    if (err) {
      console.error("Status update error:", err.message);
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Request not found" });
    }

    res.json({
      message: `Status updated to ${status}`,
      req_id,
      status
    });
  });
});

app.get('/api/indigency/:transaction_id', (req, res) => {
  const sql = `SELECT * FROM indig_req WHERE transaction_id = ?`;
  
  db.get(sql, [req.params.transaction_id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ message: "Record not found" });

    // Use your existing calculateAge helper
    const age = calculateAge(row.birthdate); 

    res.json({
      ...row,
      age: age // Send the computed age to the frontend
    });
  });
});

app.get('/api/requests/all', (req, res) => {
  const query = `
    SELECT 
      r.req_id,
      r.transaction_id,
      r.trans_id,
      r.status,
      r.created_at,

      u.user_name,
      t.trans_name,

      -- Barangay Clearance Data
      bc.address,
      bc.age,
      bc.sex,
      bc.civil_status,
      bc.birthdate,
      bc.birthplace,
      bc.purpose,

      bbc.trade_name,
      bbc.business_address


    FROM request r

    LEFT JOIN user u ON r.userid = u.userid
    LEFT JOIN transactions t ON r.trans_id = t.trans_id

    LEFT JOIN brgy_clearance_req bc 
      ON r.transaction_id = bc.transaction_id

    LEFT JOIN business_clearance_req bbc
      ON r.transaction_id = bbc.transaction_id

    ORDER BY r.req_id DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Fetch error:", err.message);
      return res.status(500).json({ error: err.message });
    }

    res.json(rows);
  });
});

app.put('/api/requests/:req_id/status', (req, res) => {
  const { status } = req.body; 
  const { req_id } = req.params;

  const sql = `UPDATE request SET status = ? WHERE req_id = ?`;

  db.run(sql, [status, req_id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    
    
    if (this.changes === 0) return res.status(404).json({ error: "Request ID not found in database" });

    res.json({ message: `Status updated to ${status}`, status });
  });
});

app.get('/api/brgyid/:transaction_id', (req, res) => {
  db.get(
    `SELECT * FROM brgyid_req WHERE transaction_id = ?`,
    [req.params.transaction_id],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: "Not found" });
      res.json(row);
    }
  );
});

app.post('/api/brgyid/submit', (req, res) => {
  const {
    userid,
    weight,
    height,
    blood_type,
    contact_person,
    contact_person_no
  } = req.body;

  // ================= VALIDATION =================
  if (!userid) {
    return res.status(400).json({ error: "User ID required" });
  }

  if (!weight || !height || !blood_type || !contact_person || !contact_person_no) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // ================= GET USER =================
  db.get(`SELECT * FROM user WHERE userid = ?`, [userid], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: "User not found" });

    const transaction_id = `BID-${Date.now()}`;
    const trans_id = 2; // ⚠️ MAKE SURE THIS MATCHES YOUR transactions TABLE

    const created_at = new Date().toISOString();

    // ================= INSERT BRGY ID =================
    db.run(
      `INSERT INTO brgyid_req (
        transaction_id, userid,
        user_name, birthdate, birthplace, sex,
        house_no, street, barangay, municipality, province,
        weight, height, blood_type,
        contact_person, contact_person_no,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        transaction_id,
        userid,
        user.user_name,
        user.birthdate,
        user.birthplace,
        user.sex,
        user.house_no,
        user.street,
        user.barangay,
        user.municipality,
        user.province,
        weight,
        height,
        blood_type,
        contact_person,
        contact_person_no,
        created_at
      ],
      function (err) {
        if (err) {
          console.error("Insert error:", err.message);
          return res.status(500).json({ error: err.message });
        }

        // ================= INSERT REQUEST =================
        db.run(
          `INSERT INTO request (transaction_id, trans_id, userid, status)
           VALUES (?, ?, ?, 'pending')`,
          [transaction_id, trans_id, userid],
          function (err) {
            if (err) return res.status(500).json({ error: err.message });

            res.json({
              message: "Barangay ID request submitted successfully",
              transaction_id
            });
          }
        );
      }
    );
  });
});

app.post('/api/brgy-clearance/submit', (req, res) => {
  const { userid, purpose } = req.body;

  if (!userid) {
    return res.status(400).json({ error: "User ID required" });
  }

  if (!purpose) {
    return res.status(400).json({ error: "Purpose is required" });
  }

  db.get(`SELECT * FROM user WHERE userid = ?`, [userid], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: "User not found" });

    const transaction_id = `BRC-${Date.now()}`;
    const trans_id = 3;
    const created_at = new Date().toISOString();

    const address = [
      user.house_no,
      user.street,
      user.barangay,
      user.municipality,
      user.province
    ].filter(Boolean).join(", ");

    const age = calculateAge(user.birthdate);

    db.run(
      `INSERT INTO brgy_clearance_req (
        transaction_id, userid,
        user_name, address, age, sex, civil_status,
        birthdate, birthplace,
        purpose, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        transaction_id,
        userid,
        user.user_name,
        address,
        age,
        user.sex,
        user.civil_status,
        user.birthdate,
        user.birthplace,
        purpose,
        created_at
      ],
      function (err) {
        if (err) {
          console.error("Insert error:", err.message);
          return res.status(500).json({ error: err.message });
        }

        db.run(
          `INSERT INTO request (transaction_id, trans_id, userid, status)
           VALUES (?, ?, ?, 'pending')`,
          [transaction_id, trans_id, userid],
          function (err) {
            if (err) return res.status(500).json({ error: err.message });

            res.json({
              message: "Barangay Clearance request submitted",
              transaction_id
            });
          }
        );
      }
    );
  });
});

app.get('/api/clearance/:transaction_id', (req, res) => {
  db.get(
    `SELECT * FROM brgy_clearance_req WHERE transaction_id = ?`,
    [req.params.transaction_id],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: "Clearance record not found" });

      res.json(row);
    }
  );
});


app.post('/api/business-clearance/submit', (req, res) => {
  const { userid, trade_name, business_address } = req.body;

  // VALIDATION
  if (!userid) {
    return res.status(400).json({ error: "User ID required" });
  }

  if (!trade_name || !business_address) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // GET USER
  db.get(`SELECT * FROM user WHERE userid = ?`, [userid], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: "User not found" });

    const transaction_id = `BBC-${Date.now()}`;
    const trans_id = 4; //
    const created_at = new Date().toISOString();

    // INSERT BUSINESS CLEARANCE
    db.run(
      `INSERT INTO business_clearance_req (
        transaction_id, userid,
        user_name, trade_name, business_address,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        transaction_id,
        userid,
        user.user_name,
        trade_name,
        business_address,
        created_at
      ],
      function (err) {
        if (err) {
          console.error("Insert error:", err.message);
          return res.status(500).json({ error: err.message });
        }

        // INSERT REQUEST
        db.run(
          `INSERT INTO request (transaction_id, trans_id, userid, status)
           VALUES (?, ?, ?, 'pending')`,
          [transaction_id, trans_id, userid],
          function (err) {
            if (err) return res.status(500).json({ error: err.message });

            res.json({
              message: "Business Clearance request submitted",
              transaction_id
            });
          }
        );
      }
    );
  });
});

app.get('/api/business-clearance/:transaction_id', (req, res) => {
  db.get(
    `SELECT * FROM business_clearance_req WHERE transaction_id = ?`,
    [req.params.transaction_id],
    (err, row) => {
      if (err) {
        console.error("Fetch error:", err.message);
        return res.status(500).json({ error: err.message });
      }

      if (!row) {
        return res.status(404).json({ error: "Business clearance not found" });
      }

      res.json(row);
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