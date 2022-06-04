const jwt = require("jsonwebtoken");
const { authenticator } = require("otplib");
const sqlite3 = require("sqlite3");

function verifyLogin(email, password, code, req, res, failPage) {
  const db = new sqlite3.Database("db.sqlite");
  db.serialize(() => {
    db.get(
      "SELECT password, secret, role FROM users LEFT JOIN roles on users.role=roles.id WHERE email = ?",
      [email],
      (err, row) => {
        if (err) {
          throw err;
        }

        if (!row) {
          return res.redirect("/");
        }

        if (!authenticator.check(code, row.secret) || row.password !== password) {
          return res.redirect(failPage);
        }

        req.session.qr = null;
        req.session.email = null;
        req.session.token = jwt.sign(email, process.env.SESSION_SECRET);
        req.session.role = row.role;

        return res.redirect("/private");
      }
    );
  });
}

module.exports = { verifyLogin };
