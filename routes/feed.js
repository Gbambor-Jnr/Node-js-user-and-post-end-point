const express = require("express");
const { body } = require("express-validator"); //the check method is used to check the headers and query paramsetc while the body is used to check the request body
const feedController = require("../controller/feed");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/posts", feedController.getPosts);
//POST REQUEST
router.post(
  "/post",
  isAuth,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedController.createPost
);

router.get("/post/:postId", feedController.getPost);

router.put(
  "/post/:postId",
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedController.updatePost
);

router.delete("/post/:postId", feedController.deletePost);
module.exports = router;
