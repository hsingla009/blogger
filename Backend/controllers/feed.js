const { validationResult } = require("express-validator/check");
const fs = require("fs");
const path = require("path");
const Post = require("../models/post");

const User = require("../models/user");
exports.getPosts = (req, res, next) => {
  const currPage = req.query.page||1;
  let totalItems;
  const perPage = 2;
  Post.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Post
        .find()
        .skip((currPage - 1) * perPage)
        .limit(perPage);
    })
    .then((posts) => {
      // console.log(posts);
      res.status(200).json({ posts: posts,totalItems:totalItems });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      // console.log(post);
      res.status(200).json({ post: post });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
exports.createPost = (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;
  // Create post in db
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    const err = new Error("Validation failed");
    err.statusCode = 422;
    throw err;
  }
  if (!req.file) {
    const err = new Error("No image found");
    err.statusCode = 422;
    throw err;
  }
  let imageUrl = req.file.path;
  let strArr = imageUrl.split("\\");
  // console.log("DFffffffffffff",strArr);
  imageUrl = strArr.join("/");
  let creater;
  const newPost = new Post({
    title: title,
    imageUrl: imageUrl,
    content: content,
    creator: req.userId,
  });
  newPost
    .save()
    .then((result) => {
      // console.log(result);
      return User.findById(req.userId)
    })
    .then(user => {
      creator = user;
      user.posts.push(newPost);
      return user.save();
    })
    .then(result => {
      res.status(201).json({
        message: 'Post created successfully!',
        post: newPost,
        creator: { _id: creator._id, name: creator.name }
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    const err = new Error("Validation failed");
    err.statusCode = 422;
    throw err;
  }
  const updatedTitle = req.body.title;
  const updatedContent = req.body.content;
  let updatedImageUrl = null;
  if (req.file) {
    updatedImageUrl = req.file.path;
  }
  // console.log("UpdatedImageUrl",updatedImageUrl);

  Post.findById(postId)
    .then((post) => {
      // console.log(post);
      if (!post) {
        const err = new Error("No post found");
        err.statusCode = 422;
        throw err;
      }
      if (post.creator.toString() !== req.userId) {
        const error = new Error('Not authorized!');
        error.statusCode = 403;
        throw error;
      }
      if (updatedImageUrl) {
        clearImage(post.imageUrl);
        post.imageUrl = updatedImageUrl;
      }
      post.title = updatedTitle;
      post.content = updatedContent;
      return post.save();
    })
    
    .then((result) => {
      // console.log("updating post" , result);
      res.status(201).json({
        message: "Post updated successfully!",
        post: result,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Could not find post.');
        error.statusCode = 404;
        throw error;
      }
      if (post.creator.toString() !== req.userId) {
        const error = new Error('Not authorized!');
        error.statusCode = 403;
        throw error;
      }
      // Check logged in user
      clearImage(post.imageUrl);
      return Post.findByIdAndRemove(postId);
    })
    .then(result => {
      return User.findById(req.userId);
    })
    .then(user => {
      user.posts.pull(postId);
      return user.save();
    })
    .then(result => {
      res.status(200).json({ message: 'Deleted post.' });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  // console.log("filePath",filePath);
  fs.unlink(filePath, (err) => {
    console.log(err);
  });
};
