const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
require("dotenv").config();
require("express-async-errors");
require("log-timestamp");
const sqlite3 = require("sqlite3");
const session = require("express-session");
const expressJWT = require("express-jwt");
const bodyParser = require("body-parser");

const routes = require("./routes");

const app = express();

app.use(helmet());
app.use(
  morgan(
    ':remote-addr - :remote-user [:date[web]] ":method :url HTTP/:http-version" :status :res[content-length]'
  )
);

app.set("view engine", "ejs");

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);

app.use(bodyParser.urlencoded({ extended: false }));

app.use("/", routes);

const jwtMiddleware = expressJWT({
  secret: process.env.SESSION_SECRET,
  algorithms: ["HS256"],
  getToken: (req) => {
    return req.session.token;
  },
});

app.get("/private", jwtMiddleware, (req, res) => {
  return res.render("private.ejs", { email: req.user, role: req.session.role });
});

app.get("/admin-private", jwtMiddleware, (req, res) => {
  if (req.session.role === 2) {
    return res.render("admin-private.ejs", {
      email: req.user,
      role: req.session.role,
    });
  } else {
    return res.redirect("/");
  }
});

app.get("/logout", jwtMiddleware, (req, res) => {
  req.session.destroy();
  return res.redirect("/");
});

const db = new sqlite3.Database("db.sqlite");
db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS `users` (`user_id` INTEGER PRIMARY KEY AUTOINCREMENT, `email` VARCHAR(255) NOT NULL UNIQUE, `password` VARCHAR(255) NOT NULL, `secret` varchar(255) NOT NULL, `role` INTEGER NOT NULL, FOREIGN KEY (`role`) REFERENCES `roles`(`role_id`) ON DELETE CASCADE)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS `roles` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `value` VARCHAR(255) NOT NULL UNIQUE)"
  );

  const roles = ["CUSTOMER", "ADMIN"];

  const stmt = db.prepare("INSERT OR IGNORE INTO roles (value) VALUES (?)");
  for (const role of roles) {
    stmt.run(role);
  }
  stmt.finalize();
});
db.close();

app.listen(3000, () => {
  console.log("listening on port 3000");
});
