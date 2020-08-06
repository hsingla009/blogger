const { validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    const err = new Error("Validation failed");
    err.statusCode = 422;
    throw err;
  }
  console.log(req);
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email: email,
        name: name,
        password: hashedPassword,
      });
      user.save();
    })
    .then((result) => {
      res.status(200).json({ message: "signup successful", result: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  User
    .findOne({ email: email })
    .then((user) => {
      if (!user) {
        const err = new Error("email not found");
        err.statusCode = 401;
        throw err;
      }
      // console.log("Login",user)
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const err = new Error("wrong password");
        err.statusCode = 401;
        throw err;
      }
      const token = jwt.sign(
        {
          email: email,
          userId: loadedUser._id.toString(),
        },
        "hsingla",
        { expiresIn: "1h" }
      );
      res.status(200).json({ token: token, userId: loadedUser._id.toString() });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
