const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const crypto = require("crypto");
const cors = require('cors');
const path = require('path');
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET || "fallback_secret";

app.use(cors({
  origin: ["https://brgy-joyao-joyao-is.up.railway.app", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
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
    CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userid INTEGER NOT NULL,
      email TEXT NOT NULL, 
      token TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      FOREIGN KEY (userid) REFERENCES user(userid)
    );
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
        app_type TEXT,
        date_issued TEXT, 
        FOREIGN KEY (userid) REFERENCES user(userid)
      );
    `)

  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      trans_id INTEGER PRIMARY KEY AUTOINCREMENT,
      trans_name TEXT NOT NULL,
      amount TEXT
    )
  `);

  const transactions = ['Indigency', 'Barangay ID', 'Barangay Clearance', 'Business Clearance', 'Incident Report'];
  transactions.forEach((name, index) => {
    db.run(
      `INSERT OR IGNORE INTO transactions (trans_id, trans_name, amount) VALUES (?, ?, ?)`,
      [index + 1, name, "0"]
    );
  });

    db.run(`
      CREATE TABLE IF NOT EXISTS request (
        req_id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_id TEXT NOT NULL,
        trans_id INTEGER NOT NULL,
        userid INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TEXT DEFAULT (DATETIME('now')),
        app_type TEXT,

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
        app_type TEXT,
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
        app_type TEXT,
        FOREIGN KEY (userid) REFERENCES user(userid)
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS incident_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_id TEXT UNIQUE,

        userid INTEGER,
        user_name TEXT,

        address TEXT, -- compressed address

        incident_date TEXT,
        incident_time TEXT,
        incident_address TEXT,
        narrative TEXT,

        status TEXT DEFAULT 'pending',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY(userid) REFERENCES user(userid)
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS open_message (
        open_mess_id TEXT PRIMARY KEY,
        sender TEXT,
        contact_num TEXT,
        narrative TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        type TEXT NOT NULL
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

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user.isAdmin !== 1) {
    return res.status(403).json({ error: "Admin only" });
  }
  next();
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
          token: token,
          userid: user.userid,
          isAdmin: user.isAdmin,
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
app.get('/api/admin/requests', authenticateToken, requireAdmin, (req, res) => {
  if (req.user.isAdmin !== 1) return res.status(403).json({ error: "Admin only" });
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

app.post('/api/admin/approve/:id', authenticateToken, requireAdmin, (req, res) => {
  if (req.user.isAdmin !== 1 ) return res.status(403).json({ error: "Unauthorized" });
  
  const userId = req.params.id;
  db.run(`UPDATE user SET isAdmin = 1, admin_status = 'approved' WHERE userid = ?`, [userId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'User approved as admin' });
  });
});

app.post('/api/admin/reject/:id', authenticateToken, requireAdmin, (req, res) => {
  if (req.user.isAdmin !== 1 ) {
    return res.status(403).json({ error: "Unauthorized" });
  }

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

app.get('/api/council/active-officials', (req, res) => {
  const sql = `
    SELECT name, role 
    FROM council 
    WHERE is_active = 1 
    AND (role = 'Punong Barangay' OR role = 'Barangay Secretary')
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({ error: "Failed to fetch council officials" });
    }

    // ✅ Always return an array
    res.json(rows || []);
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
  const { userid, app_type } = req.body;

  if (!userid) return res.status(400).json({ error: "User ID required" });
  if (!app_type) return res.status(400).json({ error: "Application type required" });

  db.get(`SELECT * FROM user WHERE userid = ?`, [userid], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: "User not found" });

    const transaction_id = `IND-${Date.now()}`;
    const trans_id = 1;

    const date_issued = new Intl.DateTimeFormat('en-PH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date());

    db.run(
      `INSERT INTO indig_req (
        transaction_id, userid, user_name, birthdate, sex, civil_status,
        house_no, street, barangay, municipality, province, app_type, date_issued
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        transaction_id,
        userid,
        user.user_name,
        user.birthdate,
        user.sex,
        user.civil_status,
        user.house_no,
        user.street,
        user.barangay,
        user.municipality,
        user.province,
        app_type,  
        date_issued
      ],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });

        db.run(
          `INSERT INTO request (transaction_id, trans_id, userid, status, app_type)
           VALUES (?, ?, ?, 'pending', ?)`,
          [transaction_id, trans_id, userid, app_type],
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
  const sql = `SELECT i.*, t.amount, r.app_type
              FROM indig_req i
              LEFT JOIN request r ON i.transaction_id = r.transaction_id
              LEFT JOIN transactions t ON r.trans_id = t.trans_id
              WHERE i.transaction_id = ?`;
  
  db.get(sql, [req.params.transaction_id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ message: "Record not found" });

    // Use your existing calculateAge helper
    const age = calculateAge(row.birthdate); 

    res.json({
      ...row,
      age: age
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
      r.app_type,
      r.created_at,

      u.user_name,
      t.trans_name,
      t.amount,

      bc.address AS bc_address,
      bc.age AS bc_age,
      bc.sex AS bc_sex,
      bc.civil_status AS bc_civil_status,
      bc.birthdate AS bc_birthdate,
      bc.birthplace AS bc_birthplace,
      bc.purpose,

      bbc.trade_name,
      bbc.business_address,
      ir.address,
      ir.incident_date,
      ir.incident_time,
      ir.incident_address,
      ir.narrative

    FROM request r
    LEFT JOIN user u ON r.userid = u.userid
    LEFT JOIN transactions t ON r.trans_id = t.trans_id
    LEFT JOIN brgy_clearance_req bc ON r.transaction_id = bc.transaction_id
    LEFT JOIN business_clearance_req bbc ON r.transaction_id = bbc.transaction_id
    LEFT JOIN incident_reports ir ON r.transaction_id = ir.transaction_id
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
    contact_person_no,
    app_type
  } = req.body;

  if (!app_type) return res.status(400).json({ error: "Application type required" });

  db.get(`SELECT * FROM user WHERE userid = ?`, [userid], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: "User not found" });

    const transaction_id = `BID-${Date.now()}`;
    const trans_id = 2;

    db.run(
        `INSERT INTO brgyid_req (
          transaction_id, userid,
          user_name, birthdate, birthplace, sex,
          house_no, street, barangay, municipality, province,
          weight, height, blood_type,
          contact_person, contact_person_no, app_type
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
          weight,              // ✅ correct
          height,              // ✅ correct
          blood_type,          // ✅ correct
          contact_person,      // ✅ correct
          contact_person_no,   // ✅ correct
          app_type             // ✅ correct
        ],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });

        db.run(
          `INSERT INTO request (transaction_id, trans_id, userid, status, app_type)
           VALUES (?, ?, ?, 'pending', ?)`,
          [transaction_id, trans_id, userid, app_type],
          () => res.json({ transaction_id })
        );
      }
    );
  });
});

app.post('/api/brgy-clearance/submit', (req, res) => {
  const { userid, purpose, app_type } = req.body;
  db.get(`SELECT * FROM user WHERE userid = ?`, [userid], (err, user) => {
    const transaction_id = `BRC-${Date.now()}`;
    const trans_id = 3; //
    const address = [user.house_no, user.street, user.barangay, user.municipality].filter(Boolean).join(", ");
    db.run(`INSERT INTO brgy_clearance_req (transaction_id, userid, user_name, address, age, sex, civil_status, birthdate, birthplace, purpose, app_type, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [transaction_id, userid, user.user_name, address, calculateAge(user.birthdate), user.sex, user.civil_status, user.birthdate, user.birthplace, purpose, app_type, new Date().toISOString()],
      () => {
        db.run(`INSERT INTO request (transaction_id, trans_id, userid, status, app_type) VALUES (?, 3, ?, 'pending', ?)`,
          [transaction_id, userid, app_type], () => res.json({ message: "Success", transaction_id }));
      });
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
  const { userid, trade_name, business_address, app_type } = req.body;

  // VALIDATION
  if (!userid) {
    return res.status(400).json({ error: "User ID required" });
  }

  if (!app_type) {
  return res.status(400).json({ error: "Application type required" });
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
        user_name, trade_name, business_address, app_type,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        transaction_id,
        userid,
        user.user_name,
        trade_name,
        business_address,
        app_type,
        created_at
      ],
      function (err) {
        if (err) {
          console.error("Insert error:", err.message);
          return res.status(500).json({ error: err.message });
        }

        // INSERT REQUEST
        db.run(
          `INSERT INTO request (transaction_id, trans_id, userid, status, app_type)
           VALUES (?, ?, ?, 'pending', ?)`,
          [transaction_id, trans_id, userid, app_type],
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

// ===================== INCIDENT REPORT SUBMISSION =====================


app.post('/api/incident-report/submit', (req, res) => {
  const { userid, incident_date, incident_time, incident_address, narrative, app_type } = req.body;

  console.log("POST /api/incident-report/submit called by user:", userid);

  if (!userid) return res.status(400).json({ error: "User ID required" });
  if (!app_type) {
  return res.status(400).json({ error: "Application type required" });
}

  db.get(`SELECT * FROM user WHERE userid = ?`, [userid], (err, user) => {
    if (err || !user) return res.status(404).json({ error: "User profile not found" });

    const transaction_id = `INC-${Date.now()}`;
    const trans_id = 5; // Matches your "Incident Report" ID
    
    const homeAddress = [user.house_no, user.street, user.barangay].filter(Boolean).join(", ");

    // Insert into incident_reports
    db.run(
      `INSERT INTO incident_reports (
        transaction_id, userid, user_name, address, 
        incident_date, incident_time, incident_address, narrative, app_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [transaction_id, userid, user.user_name, homeAddress, incident_date, incident_time, incident_address, narrative, app_type],
      function (err) {
        if (err) {
          console.error("Table Insert Error:", err.message);
          return res.status(500).json({ error: err.message });
        }

        // Insert into general requests
        db.run(
          `INSERT INTO request (transaction_id, trans_id, userid, status, app_type) VALUES (?, ?, ?, 'pending', ?)`,
          [transaction_id, trans_id, userid, app_type],
          (err2) => {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json({ message: "Incident report submitted successfully", transaction_id });
          }
        );
      }
    );
  });
});

app.get('/api/incident-report/:transaction_id', (req, res) => {
  const { transaction_id } = req.params;

  db.get(
    `SELECT * FROM incident_reports WHERE transaction_id = ?`,
    [transaction_id],
    (err, row) => {
      if (err) {
        console.error("Fetch error:", err.message);
        return res.status(500).json({ error: err.message });
      }

      if (!row) {
        return res.status(404).json({ error: "Incident report not found" });
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

// ===================== SUGGESTIONS =====================
app.post("/api/suggestions", (req, res) => {
  const { sender, contact_num, narrative } = req.body;

  if (!narrative) {
    return res.status(400).json({ error: "Suggestion is required" });
  }

  // Step 1: Get latest ID
  const getLastIdQuery = `
    SELECT open_mess_id FROM open_message
    ORDER BY created_at DESC
    LIMIT 1
  `;

  db.get(getLastIdQuery, [], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to generate ID" });
    }

    let newId = "SUG-00001";

    if (row && row.open_mess_id) {
      const lastNumber = parseInt(row.open_mess_id.split("-")[1]);
      const nextNumber = lastNumber + 1;

      newId = "SUG-" + String(nextNumber).padStart(5, "0");
    }

    // Step 2: Insert with new ID
    const insertQuery = `
      INSERT INTO open_message (open_mess_id, sender, contact_num, narrative, type)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.run(insertQuery, [newId, sender, contact_num, narrative, "suggestion"], function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to save suggestion" });
      }

      res.json({
        message: "Suggestion submitted successfully",
        id: newId
      });
    });
  });
});

// GET all open messages
app.get("/api/open-messages", (req, res) => {
  const { type } = req.query; // Extract type from query parameters
  let sql = `SELECT * FROM open_message`; // Use 'let' so we can append to it
  const params = [];

  if (type) {
    sql += " WHERE type = ?";
    params.push(type);
  }

  sql += " ORDER BY created_at DESC";

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch messages" });
    }
    res.json(rows);
  });
});

// DELETE message
app.delete("/api/open-messages/:id", (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM open_message WHERE open_mess_id = ?`;

  db.run(sql, [id], function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to delete message" });
    }

    res.json({ message: "Deleted successfully" });
  });
});

// CREATE complaint
app.post("/api/complaints", (req, res) => {
  const { sender, contact_num, narrative } = req.body;

  if (!narrative) {
    return res.status(400).json({ error: "Complaint text is required" });
  }

  const getLastIdQuery = `
    SELECT open_mess_id FROM open_message 
    WHERE open_mess_id LIKE 'COM-%' 
    ORDER BY open_mess_id DESC 
    LIMIT 1
  `;

  db.get(getLastIdQuery, [], (err, row) => {
    if (err) {
      console.error("ID Generation Error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    let newId = "COM-00001";

    if (row && row.open_mess_id) {
      const lastParts = row.open_mess_id.split("-");
      const lastNum = parseInt(lastParts[1], 10);
      newId = `COM-${String(lastNum + 1).padStart(5, '0')}`;
    }

    const insertQuery = `
      INSERT INTO open_message (open_mess_id, sender, contact_num, narrative, type)
      VALUES (?, ?, ?, ?, 'complaint')
    `;

    db.run(insertQuery, [newId, sender, contact_num, narrative], function (err) {
      if (err) {
        console.error("Insert Error:", err);
        return res.status(500).json({ error: "Failed to submit complaint" });
      }

      res.json({
        message: "Complaint submitted successfully",
        id: newId
      });
    });
  });
});



// ===================== GET USER REQUESTS =====================
app.get('/api/requests/user/:userid', (req, res) => {
  const { userid } = req.params;

  const query = `
    SELECT 
      r.req_id,
      r.transaction_id,
      r.status,
      r.app_type,
      r.created_at,

      t.trans_name,
      r.trans_id,
      t.amount,

      -- Indigency
      i.date_issued,

      -- Barangay ID
      b.birthdate,
      b.blood_type,

      -- Clearance
      bc.purpose,

      -- Business
      bb.trade_name,

      -- Incident
      ir.incident_date,
      ir.incident_time

    FROM request r
    LEFT JOIN transactions t ON r.trans_id = t.trans_id

    LEFT JOIN indig_req i ON r.transaction_id = i.transaction_id
    LEFT JOIN brgyid_req b ON r.transaction_id = b.transaction_id
    LEFT JOIN brgy_clearance_req bc ON r.transaction_id = bc.transaction_id
    LEFT JOIN business_clearance_req bb ON r.transaction_id = bb.transaction_id
    LEFT JOIN incident_reports ir ON r.transaction_id = ir.transaction_id

    WHERE r.userid = ?
    ORDER BY r.created_at DESC
  `;

  db.all(query, [userid], (err, rows) => {
    if (err) {
      console.error("Fetch user requests error:", err.message);
      return res.status(500).json({ error: err.message });
    }

    res.json(rows);
  });
});

app.delete('/api/requests/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM request WHERE req_id = ?`;

  db.run(sql, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: "Failed to delete request" });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Request not found" });
    }

    res.json({ message: "Request deleted successfully" });
  });
});

app.delete("/api/council/delete/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM council WHERE council_id = ?", [id], function(err) {
    if (err) {
      return res.status(500).json({ error: "Failed to delete member" });
    }

    res.json({ message: "Deleted successfully" });
  });
});

app.get('/api/users', (req, res) => {
  db.all(
    `SELECT 
      userid AS id,
      user_name AS name,
      email_ad AS email,
      sex,
      civil_status,
      contact_no,
      barangay,
      municipality,
      province,
      birthdate,
      birthplace,
      isAdmin
     FROM user`,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// ===================== COMPLETE USER DELETE ENDPOINT =====================
app.delete('/api/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;

  const runQuery = (sql, params) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve(this);
      });
    }); 
  };

  try {
    await runQuery("BEGIN TRANSACTION");

    console.log(`[Admin] Attempting full purge for User ID: ${id}`);

    const tables = [
      "password_resets", 
      "council", 
      "indig_req", 
      "brgyid_req", 
      "brgy_clearance_req", 
      "business_clearance_req", 
      "incident_reports", 
      "request"
    ];

    for (const table of tables) {
      await runQuery(`DELETE FROM ${table} WHERE userid = ?`, [id]);
    }

    const result = await runQuery(
      "DELETE FROM user WHERE userid = ? OR CAST(userid AS TEXT) = ?", 
      [id, id]
    );

    await runQuery("COMMIT");

    if (result.changes === 0) {
      console.warn(`[Admin] Delete failed: User ${id} not found.`);
      return res.status(404).json({ error: "User not found in database." });
    }

    console.log(`[Admin] Purge successful for User ${id}.`);
    res.json({ message: "User and all associated data deleted successfully" });

  } catch (err) {
    // 5. Rollback on error so the DB doesn't stay in a partial delete state
    await runQuery("ROLLBACK");
    console.error("CRITICAL DELETE ERROR:", err.message);
    res.status(500).json({ error: "Internal Server Error: " + err.message });
  }
});

app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;

  const {
    name,
    email,
    civil_status,
    sex,
    birthdate,
    birthplace,
    contact_no,
    barangay,
    municipality,
    province
  } = req.body;

  // Basic validation
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  db.run(
    `UPDATE user SET
      user_name = ?,
      email_ad = ?,
      civil_status = ?,
      sex = ?,
      birthdate = ?,
      birthplace = ?,
      contact_no = ?,
      barangay = ?,
      municipality = ?,
      province = ?
    WHERE userid = ?`,
    [
      name,
      email,
      civil_status,
      sex,
      birthdate,
      birthplace,
      contact_no,
      barangay,
      municipality,
      province,
      id
    ],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE")) {
          return res.status(400).json({ error: "Email already exists" });
        }
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ message: "User updated successfully" });
    }
  );
});


// ===================== STATISTICS =====================
app.get('/api/statistics', (req, res) => {
  const stats = {};

  // 1. Population (non-admin users)
  const populationQuery = `
    SELECT COUNT(*) AS count 
    FROM user 
    WHERE isAdmin = 0
  `;

  // 2–5. Sex & Civil Status
  const demographicQuery = `
    SELECT 
      SUM(CASE WHEN sex = 'Female' THEN 1 ELSE 0 END) AS female,
      SUM(CASE WHEN sex = 'Male' THEN 1 ELSE 0 END) AS male,
      SUM(CASE WHEN civil_status = 'Married' THEN 1 ELSE 0 END) AS married,
      SUM(CASE WHEN civil_status = 'Single' THEN 1 ELSE 0 END) AS single,
      SUM(CASE WHEN civil_status = 'Widowed' THEN 1 ELSE 0 END) AS widowed,
      SUM(CASE WHEN isPWD = 1 THEN 1 ELSE 0 END) AS pwd,
      SUM(CASE WHEN isSenior = 1 THEN 1 ELSE 0 END) AS senior
    FROM user
  `;

  // 7. Unique households (residency count)
  const residencyQuery = `
    SELECT COUNT(DISTINCT house_no) AS count 
    FROM user
    WHERE house_no IS NOT NULL AND house_no != ''
  `;

  // 10. Accepted businesses
  const businessQuery = `
    SELECT COUNT(*) AS count
    FROM request
    WHERE trans_id = 4 AND status = 'accepted'
  `;

  // Execute queries sequentially
  db.get(populationQuery, [], (err, popRow) => {
    if (err) return res.status(500).json({ error: err.message });
    stats.population = popRow.count;

    db.get(demographicQuery, [], (err, demoRow) => {
      if (err) return res.status(500).json({ error: err.message });

      stats.female = demoRow.female || 0;
      stats.male = demoRow.male || 0;
      stats.married = demoRow.married || 0;
      stats.single = demoRow.single || 0;
      stats.widowed = demoRow.widowed || 0;
      stats.pwd = demoRow.pwd || 0;
      stats.senior = demoRow.senior || 0;

      db.get(residencyQuery, [], (err, resRow) => {
        if (err) return res.status(500).json({ error: err.message });
        stats.households = resRow.count;

        db.get(businessQuery, [], (err, busRow) => {
          if (err) return res.status(500).json({ error: err.message });
          stats.businesses = busRow.count;

          res.json(stats);
        });
      });
    });
  });
});

// ===================== RESIDENTIAL TREND =====================
app.get("/api/statistics/residentials", (req, res) => {
  const query = `
    SELECT residence_start_date, birthdate
    FROM user
    WHERE residence_start_date IS NOT NULL
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: err.message });
    }

    const yearlyMap = {};
    let minors = 0;
    let adults = 0;

    const currentYear = new Date().getFullYear();

    rows.forEach(row => {
      // ---- Trend ----
      if (row.residence_start_date) {
        const year = new Date(row.residence_start_date).getFullYear();
        if (!isNaN(year)) {
          yearlyMap[year] = (yearlyMap[year] || 0) + 1;
        }
      }

      // ---- Age ----
      if (row.birthdate) {
        const birthYear = new Date(row.birthdate).getFullYear();
        const age = currentYear - birthYear;

        if (!isNaN(age)) {
          if (age < 18) minors++;
          else adults++;
        }
      }
    });

    const trend = Object.keys(yearlyMap)
      .sort((a, b) => a - b)
      .map(year => ({
        year: Number(year),
        count: yearlyMap[year],
      }));

    const mostYear = trend.reduce((max, item) =>
      !max || item.count > max.count ? item : max,
      null
    );

    res.json({
      trend,
      mostYear,
      demographics: {
        minors,
        adults,
      },
    });
  });
});

// ===================== TRANSACTION COUNTS =====================
app.get('/api/statistics/transactions', (req, res) => {
  const query = `
    SELECT 
      SUM(CASE WHEN trans_id = 1 THEN 1 ELSE 0 END) AS indigency,
      SUM(CASE WHEN trans_id = 2 THEN 1 ELSE 0 END) AS brgyId,
      SUM(CASE WHEN trans_id = 3 THEN 1 ELSE 0 END) AS clearance,
      SUM(CASE WHEN trans_id = 4 THEN 1 ELSE 0 END) AS business,
      SUM(CASE WHEN trans_id = 5 THEN 1 ELSE 0 END) AS incident
    FROM request
  `;

  db.get(query, [], (err, row) => {
    if (err) {
      console.error("Transaction stats error:", err.message);
      return res.status(500).json({ error: err.message });
    }

    res.json({
      indigency: row.indigency || 0,
      brgyId: row.brgyId || 0,
      clearance: row.clearance || 0,
      business: row.business || 0,
      incident: row.incident || 0,
    });
  });
});

app.post("/api/auth/check-reset-status", (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "Email is required" });

  const sql = `
    SELECT token, status 
    FROM password_resets 
    WHERE email = ? 
    ORDER BY created_at DESC 
    LIMIT 1
  `;

  db.get(sql, [email], (err, row) => {
    if (err) {
      console.error("DEBUG: Check Status DB Error:", err.message);
      return res.status(500).json({ error: "Database error" });
    }

    if (!row) {
      return res.status(404).json({ error: "No reset request found for this email" });
    }
    res.json(row); 
  });
});

app.post("/api/auth/reset-password", (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: "Missing fields" });
  }

  db.get(
    `SELECT * FROM password_resets 
     WHERE token = ? AND status = 'pending'`,
    [token],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });

      if (!row) {
        return res.status(400).json({ error: "Invalid token" });
      }

      if (new Date(row.expires_at) < new Date()) {
        return res.status(400).json({ error: "Token expired" });
      }

      db.run(
        "UPDATE user SET password = ? WHERE userid = ?",
        [newPassword, row.userid],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });

          db.run(
            "UPDATE password_resets SET status = 'used' WHERE token = ?",
            [token]
          );

          res.json({ message: "Password updated successfully" });
        }
      );
    }
  );
});

app.post("/api/auth/approve-reset", (req, res) => {
  const { token } = req.body;

  db.run(
    `UPDATE password_resets SET status = 'approved' WHERE token = ?`,
    [token],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      res.json({ message: "Reset approved" });
    }
  );
});

app.get("/api/admin/reset-requests", authenticateToken, (req, res) => {
  // In your Admin fetch route
  const sql = "SELECT * FROM password_resets WHERE status != 'used' ORDER BY created_at DESC";
  db.all(
    "SELECT * FROM password_resets",
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      console.log("ROWS:", rows);
      res.json(rows);
    }
  );
  
});

app.post("/api/admin/reset-approve/:token", authenticateToken, (req, res) => {
  const { token } = req.params;

  db.run(
    "UPDATE password_resets SET status = 'approved' WHERE token = ?",
    [token],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      if (this.changes === 0) {
        return res.status(404).json({ error: "Token not found" });
      }

      res.json({ message: "Request approved" });
    }
  );
});

app.get("/api/auth/check-reset-status/:token", (req, res) => {
  const { token } = req.params;

  db.get(
    "SELECT status FROM password_resets WHERE token = ?",
    [token],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });

      if (!row) {
        return res.status(404).json({ status: "invalid" });
      }

      res.json({ status: row.status }); // pending | approved | used
    }
  );
});

app.post("/api/auth/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  // 1. Find the userid associated with this approved token
  const findUserSql = `SELECT userid FROM password_resets WHERE token = ? AND status = 'approved'`;

  db.get(findUserSql, [token], async (err, row) => {
    if (err || !row) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const userId = row.userid;

    try {
      // ✅ UPDATE: Hash the new password before saving
      // This ensures it matches the format your Login logic expects
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // 2. Update the passwordhash column with the HASHED version
      const updateSql = `UPDATE user SET passwordHash = ? WHERE userid = ?`;

      db.run(updateSql, [hashedPassword, userId], function(updateErr) {
        if (updateErr) {
          console.error("SQL UPDATE ERROR:", updateErr.message);
          return res.status(500).json({ error: "Failed to update database" });
        }

        // 3. Mark the token as 'used' or DELETE it so it can't be reused
        // Using DELETE is often cleaner for "finishing touches"
        db.run(`DELETE FROM password_resets WHERE token = ?`, [token]);

        res.json({ message: "Password updated successfully!" });
      });
    } catch (hashError) {
      console.error("Hashing error:", hashError);
      res.status(500).json({ error: "Error processing password" });
    }
  });
});

app.post("/api/auth/forgot-password", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  // 1. Check if user exists (using your email_ad column)
  db.get("SELECT userid FROM user WHERE email_ad = ?", [email], (err, user) => {
    if (err) return res.status(500).json({ error: "Database lookup error" });
    if (!user) return res.status(404).json({ error: "No account found with that email" });

    // 2. Prepare data
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000).toISOString(); // 1 hour

    // ✅ THE ROOT FIX: Generate local timestamp in 'YYYY-MM-DD HH:MM:SS' format
    // This overrides the database's default UTC behavior
    const now = new Date();
    const localTimestamp = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0') + ' ' +
      String(now.getHours()).padStart(2, '0') + ':' +
      String(now.getMinutes()).padStart(2, '0') + ':' +
      String(now.getSeconds()).padStart(2, '0');

    // 3. THE INSERT - Now explicitly providing created_at
    const sql = `
      INSERT INTO password_resets (userid, email, token, expires_at, created_at) 
      VALUES (?, ?, ?, ?, ?)
    `;
    
    db.run(sql, [user.userid, email, token, expires, localTimestamp], function(insertErr) {
      if (insertErr) {
        console.error("SQL INSERT ERROR:", insertErr.message); 
        return res.status(500).json({ error: "Failed to save reset request: " + insertErr.message });
      }
      
      console.log(`Success! Request saved at ${localTimestamp} for: ${email}`);
      res.json({ message: "Reset request sent to admin.", token });
    });
  });
});

app.post("/api/auth/reset-password", (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: "Token and new password required" });
  }

  db.get(
    `SELECT * FROM password_resets WHERE token = ?`,
    [token],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });

      if (!row) {
        return res.status(400).json({ error: "Invalid token" });
      }

      if (row.status !== "pending") {
        return res.status(400).json({ error: "Token already used" });
      }

      if (new Date(row.expires_at) < new Date()) {
        return res.status(400).json({ error: "Token expired" });
      }

      bcrypt.hash(newPassword, 10, (hashErr, hashedPassword) => {
        if (hashErr) {
          return res.status(500).json({ error: "Hashing failed" });
        }

        db.run(
          `UPDATE user SET passwordHash = ? WHERE userid = ?`,
          [hashedPassword, row.userid],
          function (err) {
            if (err) return res.status(500).json({ error: err.message });

            db.run(
              `UPDATE password_resets SET status = 'used' WHERE token = ?`,
              [token]
            );

            res.json({ message: "Password reset successful" });
          }
        );
      });
    }
  );
});

app.get('/api/users/filter', (req, res) => {
  const { type } = req.query;

  let query = `
    SELECT 
      user_name AS name,
      birthdate,
      contact_no,

      house_no,
      street,
      barangay,
      municipality,
      province

    FROM user
    WHERE isAdmin = 0
  `;

  // FILTERS
  if (type === "male") {
    query += " AND LOWER(sex) = 'male'";
  } 
  else if (type === "female") {
    query += " AND LOWER(sex) = 'female'";
  } 
  else if (type === "pwd") {
    query += " AND isPWD = 1";
  } 
  else if (type === "senior") {
    query += " AND isSenior = 1";
  }

  query += " ORDER BY user_name ASC";

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: err.message });
    }

    const formatted = rows.map(u => {
      const age = u.birthdate
        ? new Date().getFullYear() - new Date(u.birthdate).getFullYear()
        : "";

      const address = [
        u.house_no,
        u.street,
        u.barangay,
        u.municipality,
        u.province
      ].filter(Boolean).join(", ");

      return {
        name: u.name,
        age,
        address,
        birthdate: u.birthdate,
        contact_no: u.contact_no
      };
    });

    res.json(formatted);
  });
});
// ===================== START SERVER =====================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on port ${PORT}`);
});

