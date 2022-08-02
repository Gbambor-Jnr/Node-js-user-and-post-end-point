const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "I am New",
  },
  post: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post", //this is to get the ID from the Post model and add a post to every user
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
