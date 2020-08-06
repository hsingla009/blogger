const express = require("express");
const feedControllers = require("../controllers/feed");
const router = express.Router();
const { body } = require("express-validator/check");
const isAuth = require('../middleware/isAuth');
router.get("/posts",isAuth, feedControllers.getPosts);
router.get("/post/:postId",isAuth, feedControllers.getPost);

router.post(
  "/post",isAuth,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedControllers.createPost
);

router.put(
  "/post/:postId",isAuth,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedControllers.updatePost
);
router.delete("/post/:postId",isAuth,feedControllers.deletePost);
module.exports = router;
