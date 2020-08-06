const express = require("express");
const router = express.Router();
const { body } = require("express-validator/check");
const authController = require("../controllers/auth");
const User = require("../models/user");
const { route } = require("./feed");
router.put(
  "/signup",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("please enter a valid email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("E-mail exist");
          }
        });
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
    body("name").trim().isLength({ min: 5 }),
  ],
  authController.signup
);

router.post('/login',authController.login);
module.exports = router;
