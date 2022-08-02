const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  port: process.env.PORT,
  mongoUser: process.env.MONGO_USER,
  password: process.env.MONGO_PASSWORD,
  database: process.env.MONGO_DATABASE,
};
