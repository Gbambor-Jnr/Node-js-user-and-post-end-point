const authController = require("../controller/auth");
const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const User = require("../models/user");
router.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("enter a valid email") //error message incase of eerror
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Email Address already exists");
          }
        });
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
    body("name").not().isEmpty(),
  ],
  authController.signup
);

router.post("/login", authController.login);

module.exports = router;
