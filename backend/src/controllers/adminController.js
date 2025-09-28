const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

// admin login (POST)
async function loginPage(req, res) {
  // For API-driven frontends, this endpoint may be unused.
  res.json({ message: 'Admin login endpoint' });
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, admin.passwordHash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    // create session
    req.session.adminId = admin._id;
    req.session.username = admin.username;
    req.session.role = admin.role;

    res.json({ message: 'ok' });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res) {
  req.session.destroy(err => {
    res.clearCookie('connect.sid');
    res.json({ message: 'logged out' });
  });
}

module.exports = { loginPage, login, logout };
