const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//Get the models
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");

//Validation
const validatePostInput = require("../../validation/post");
// responds to /api/posts/test
router.get("/test", (req, res) => res.json({ msg: "Posts works" }));

// route- GET  /api/posts/
// desc-  Gets all the posts
//access- public
router.get("/", (req, res) => {
  Post.find({})
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ nopostsfound: "No Posts Found" }));
});

// route- GET  /api/posts/:post_id
// desc-  Gets single post, matching post_id
//access- public
router.get("/:post_id", (req, res) => {
  Post.findById(req.params.post_id)
    .then(post => res.json(post))
    .catch(err =>
      res.status(404).json({ nopostfound: "No Post Found with that ID" })
    );
});

// route- responds to POST  /api/posts/
// desc-  Create post
//access- private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });
    newPost.save().then(post => res.json(post));
  }
);

// route- POST  /api/posts/like/:post_id
// desc-  Post to like a single post, matching post_id
//access- private
router.post(
  "/like/:post_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.post_id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return res
              .status(400)
              .json({ alreadyliked: "User already like this Post" });
          }
          post.likes.unshift({ user: req.user.id });
          post.save().then(npost => res.json(npost));
        })
        .catch(err =>
          res.status(404).json({ nopostfound: "No Post Found with that ID" })
        );
    });
  }
);

// route- POST  /api/posts/unlike/:post_id
// desc-  Post to unlike a single post, matching post_id
//access- private
router.post(
  "/unlike/:post_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.post_id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ alreadyliked: "User has not liked this Post Yet" });
          }
          const removeIndex = post.likes
            .map(like => like.user.toString())
            .indexOf(req.user.id);
          post.likes.splice(removeIndex, 1);
          post.save().then(npost => res.json(npost));
        })
        .catch(err =>
          res.status(404).json({ nopostfound: "No Post Found with that ID" })
        );
    });
  }
);

// route- POST  /api/posts/comment/:post_id
// desc-  Post a comment to single post, matching post_id
//access- private
router.post(
  "/comment/:post_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    Post.findById(req.params.post_id)
      .then(post => {
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.user.id
        };
        post.comments.unshift(newComment);
        post.save().then(npost => res.json(npost));
      })
      .catch(err =>
        res.status(404).json({ nopostfound: "No Post Found with that ID" })
      );
  }
);

// route- DELETE  /api/posts/comment/:post_id/:comment_id
// desc-  Deletes a comment to post with id post_id , matching comment_id
//access- private
router.delete(
  "/comment/:post_id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.post_id)
      .then(post => {
        //Check if comment exists
        if (
          post.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return res
            .status(404)
            .json({ commentnotexists: "Comment not Found" });
        }
        const removeIndex = post.comments
          .map(comment => comment._id.toString())
          .indexOf(req.params.comment_id);
        post.comments.splice(removeIndex, 1);
        post.save().then(npost => res.json(npost));
      })
      .catch(err =>
        res.status(404).json({ nopostfound: "No Post Found with that ID" })
      );
  }
);

// route- DELETE  /api/posts/:post_id
// desc-  Deletes single post, matching post_id
//access- private
router.delete(
  "/:post_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.post_id)
      .then(post => {
        //Check for post owner
        if (post.user.toString() !== req.user.id) {
          return res
            .status(401)
            .json({ notauthorized: "User not authorized to delete this post" });
        }
        post.remove().then(() => res.json({ success: true }));
      })
      .catch(err =>
        res.status(404).json({ nopostfound: "No Post Found with that ID" })
      );
  }
);

module.exports = router;
