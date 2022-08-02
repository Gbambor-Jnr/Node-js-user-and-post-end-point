const User = require("../models/user");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Please input invalid stuff");
    error.statusCode = 422;
    error.data = errors.array(); //this stores the array of errors and it allows us to keep our errors which was retrieved by the validation package
    throw error;
  }
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;

  bcrypt
    .hash(password, 12)
    .then((hashedPassowrd) => {
      const user = new User({
        email: email,
        password: hashedPassowrd,
        name: name,
      });
      return user.save();
    })
    .then((result) =>
      res.status(201).json({ message: "User Created", userId: result._id })
    )
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

// exports.login = (req, res, next) => {
//   const email = req.body.email;
//   const password = req.body.password;
//   let loadedUser;
//   return User.findOne({ email: email })
//     .then((user) => {
//       if (!user) {
//         const error = new Error("This user does not exist");
//         error.statusCode = 401; //404 could also be used here and 401 means
//         throw error;
//       }
//       loadedUser = user;
//       return bcrypt.compare(password, user.password);
//     })
//     .then((isEqual) => {
//       if (!isEqual) {
//         const error = new Error("Password is incorrect");
//         error.statusCode = 401;
//         throw error;
//       }
//       const token = jwt.sign(
//         {
//           email: loadedUser.email,
//           userId: loadedUser._id.toString(),
//         },
//         "omoYorubaLemmeSecret",
//         { expiresIn: "1h" }
//       );
//       return res
//         .status(200)
//         .json({ token: token, userId: loadedUser._id.toString() });
//     })
//     .catch((err) => {
//       if (!err.statusCode) {
//         err.statusCode = 500;
//       }
//       next(err);
//     });
// };

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("This user does not exist");
      error.statusCode = 401; //404 could also be used here and 401 means
      throw error;
    }
    loadedUser = user;
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Password is incorrect");
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign(
      {
        email: loadedUser.email,
        userId: loadedUser._id.toString(),
      },
      "omoYorubaLemmeSecret",
      { expiresIn: "1h" }
    );
    return res
      .status(200)
      .json({ token: token, userId: loadedUser._id.toString() });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
