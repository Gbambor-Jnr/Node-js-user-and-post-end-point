const { validationResult } = require("express-validator");
const Post = require("../models/post");
const path = require("path");
const post = require("../models/post");

// exports.getPosts = (req, res, next) => {

//   const perpage = 3;
//   let totalItems;
//   const page = req.query.page || 1;
//   Post.find()
//     .countDocuments()
//     .then((count) => {
//       totalItems = count;
//       return Post.find()
//         .skip((page - 1) * perpage)
//         .limit(perpage);
//     })

//     .then((posts) => {
//       res
//         .status(200)
//         .json({ message: "FETCHED", posts: posts, totalItems: totalItems });
//     })
//     .catch((err) => {
//       if (!err.statusCode) {
//         err.statusCode = 522;
//       }
//       next(err);
//     });
// };

exports.getPosts = async (req, res, next) => {
  const perpage = 3;
  // let totalItems;
  const page = req.query.page || 1;

  try {
    const totalItems = Post.find().countDocuments();
    const posts = await Post.find()
      .skip((page - 1) * perpage)
      .limit(perpage);
    res
      .status(200)
      .json({ message: "FETCHED", posts: posts, totalItems: totalItems });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 522;
    }
    next(err);
  }
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  const title = req.body.title;
  const content = req.body.content;
  if (!errors.isEmpty()) {
    // return res.status(422).json({
    //   message: "Validation failed, invalid details",
    //   errors: errors.array(),
    // });
    const error = new Error(
      "Validation failed, the details you input was invalid"
    );
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    const error = new Error("no files found");
    error.statusCode = 422;
    throw error;
  }
  const imageUrl = req.file.path;
  const post = new Post({
    title: title,
    imageUrl: imageUrl,
    // imageUrl: "images/flower.jpeg",
    content: content,
    creator: { name: "ikenna" },
  });
  post
    .save()
    .then((result) => {
      res.status(201).json({ message: "Created Succesfully", post: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.sttatusCode = 522;
      }
      next(err);
    });

  //status 201 means successfull and a resource was created

  //POSTMAN METHOD
  // res.status(201).json({
  // message: "Post Created Succesfully",
  // post: {
  //   _id: Math.random(),
  //   title: title,
  //   content: content,
  //   creator: { name: "Ikenna" },
  //   createdAt: new Date(),
  // },
  // });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("No page found");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: "Found", post: post });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 522;
      }
      next(err);
    });
};

exports.updatePost = (req, res, next) => {
  const errors = validationResult(req);
  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;
  if (!errors.isEmpty()) {
    const error = new Error(
      "Validation failed, the details you input was invalid"
    );
    error.statusCode = 422;
    throw error;
  }

  if (req.file) {
    imageUrl = req.path.file;
  }

  if (!imageUrl) {
    const error = new Error("No file selected");
    error.statusCode = 422;
    throw error;
  }

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("No Posts Found");
        error.statusCode = 422;
        throw error;
      }
      if (post.imageUrl !== imageUrl) {
        deleteImage(post.imageUrl);
      }

      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;

      return post.save();
    })

    .then((result) => {
      res.status(200).json({ message: "succesfully updated", post: result }); //statuscode of 200 is only for when we create a new post
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 522;
        next(err);
      }
    });
};

const deleteImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath); //the ".." means since we are inside the feed.js move one step to the controller which is on the same path with the images folder
  filePath.unlink(filePath, (err) => console.log(err));
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.find(postId)
    .then((post) => {
      deleteImage(postId);
    })
    .then((result) => {})
    .catch((err) => console.log(err));
  Post.findByIdAndRemove(postId)
    // Post.findById(postId)
    //   .then((post) => {
    //     if (!post) {
    //       console.log("idiot");
    //       const error = new Error("No Posts Found");
    //       error.statusCode = 422;
    //       throw error;
    //     }
    //     console.log("mumu");
    //     deleteImage(post.imageUrl);
    //     return post.findByIdAndRemove(postId);
    //   })
    .then((result) => {
      res.status(200).json({ message: "post deleted succesfully" });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 522;
        next(err);
      }
    });
};
