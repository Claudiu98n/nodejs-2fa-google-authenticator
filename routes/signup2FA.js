const Router = require("express").Router();
const { verifyLogin } = require("../utils/verifyLogin");

Router.get("/sign-up-2fa", (req, res) => {
  if (!req.session.qr) {
    return res.redirect("/");
  }

  return res.render("signup-2fa.ejs", { qr: req.session.qr });
});

Router.post("/sign-up-2fa", (req, res) => {
  if (!req.session.email) {
    return res.redirect("/");
  }

  const email = req.session.email,
    password = req.session.password,
    code = req.body.code;

  return verifyLogin(email, password, code, req, res, "/sign-up-2fa");
});

module.exports = Router;
