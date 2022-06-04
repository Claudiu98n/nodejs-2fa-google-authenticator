const Router = require("express").Router();
const { verifyLogin } = require("../utils/verifyLogin");

Router.get("/login", (req, res) => {
  return res.render("login.ejs");
});

Router.post("/login", (req, res) => {
  const email = req.body.email,
    password = req.body.password,
    code = req.body.code;

  return verifyLogin(email, password, code, req, res, "/login");
});

module.exports = Router;
