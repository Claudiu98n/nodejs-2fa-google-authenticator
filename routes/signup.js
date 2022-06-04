const QRCode = require("qrcode");
const sqlite3 = require("sqlite3");
const { authenticator } = require("otplib");

const Router = require("express").Router();

Router.get("/", (req, res) => {
  res.render("signup.ejs");
});

Router.post("/sign-up", (req, res) => {
  const email = req.body.email,
    password = req.body.password,
    role = req.body.role,
    secret = authenticator.generateSecret();

  const db = new sqlite3.Database("db.sqlite");
  db.serialize(() => {
    // verify if email is alreayd in the database
    db.get("SELECT * FROM users WHERE email = ?", email, (err, row) => {
      if (err) {
        return res.render("signup.ejs", { error: "Something went wrong" });
      } else if (row) {
        return res.render("signup.ejs", { error: "Email already exists" });
      } else {
        db.run(
          "INSERT INTO `users`(`email`, `password`, `role`, `secret`) VALUES (?, ?, ?, ?)",
          [email, password, role, secret],
          (err) => {
            if (err) {
              throw err;
            }

            QRCode.toDataURL(authenticator.keyuri(email, "2FA Node App", secret), (err, url) => {
              if (err) {
                throw err;
              }

              req.session.qr = url;
              req.session.email = email;
              req.session.password = password;
              res.redirect("/sign-up-2fa");
            });
          }
        );
      }
    });
  });
});

module.exports = Router;
