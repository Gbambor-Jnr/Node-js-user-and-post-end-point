const express = require("express");
const bodyParser = require("body-parser");
const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const multer = require("multer");
const compression = require("compression");
const helmet = require("helmet");
const { port, password, mongoUser, database } = require("./config");

app.use(bodyParser.json());
app.use("/images", express.static(path.join(__dirname, "images")));

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images"); //null means no error and images means the image folder on my project
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(
  multer({
    storage: fileStorage,
    fileFilter: fileFilter,
  }).single("image") //single informs multer that we have to extract a single file in a field called image
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); //the wildcard * means allow for all site
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);
app.use(compression());
app.use(helmet());
app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(
    `mongodb+srv://${mongoUser}:${password}@cluster0.kytwgsm.mongodb.net/${database}?retryWrites=true`
  )
  .then((result) => app.listen(process.env.PORT || 8089))

  .catch((err) => console.log(err));
