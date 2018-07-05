const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
//load Profile Model, User Model
const Profile = require("../../models/Profile.js");
const User = require("../../models/User.js");

//Validation
const validateProfileInput = require("../../validation/profile");
const validateExperienceInput = require("../../validation/experience");
const validateEducationInput = require("../../validation/education");
// responds to /api/profile/test
router.get("/test", (req, res) => res.json({ msg: "Profile works" }));

// route- responds to GET /api/profile/
// desc-  Gets the current user
//access- private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.user.id })
      .populate("user", ["name", "avatar"])
      .then(profile => {
        if (!profile) {
          errors.noprofile = "No Profile Found for this user";
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch(err => res.status(404).json(err));
  }
);

// route- responds to GET /api/profile/all
// desc-  Gets all the profiles
//access- public
router.get("/all", (req, res) => {
  const errors = {};
  Profile.find({})
    .populate("user", ["name", "avatar"])
    .then(profiles => {
      if (!profiles) {
        errors.noprofile = "No Profiles Found";
        res.status(404).json(errors);
      }
      res.json(profiles);
    })
    .catch(err => res.status(404).json({ profile: "No Profiles Found" }));
});

// route- responds to GET /api/profile/handle/:handle
// desc-  Gets the profile by handle
//access- public
router.get("/handle/:handle", (req, res) => {
  const errors = {};
  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "No Profile for this handle";
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

// route- responds to GET /api/profile/user/:user_id
// desc-  Gets the profile by userID
//access- public
router.get("/user/:user_id", (req, res) => {
  const errors = {};
  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "No Profile for this userID";
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err =>
      res.status(404).json({ profile: "No Profile for this userID" })
    );
});

// route- responds to POST /api/profile/
// desc-  Create or Edit User Profile
//access- private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    //Get Fields
    const { errors, isValid } = validateProfileInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;
    //   skills should be split to an array
    if (typeof req.body.skills !== "undefined")
      profileFields.skills = req.body.skills.split(",");

    //Social
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;

    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        //update
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then(newprofile => res.json(newprofile));
      } else {
        //check if handle exists
        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          if (profile) {
            errors.handle = "That handle already exists";
            res.status(400).json(errors);
          }
          //create a new profile for current user
          new Profile(profileFields).save().then(profile => res.json(profile));
        });
      }
    });
  }
);

// route- responds to POST /api/profile/experience
// desc-  Add experience to Profile
//access- private
router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    Profile.findOne({ user: req.user.id }).then(profile => {
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };
      profile.experience.unshift(newExp);
      profile.save().then(newprofile => res.json(newprofile));
    });
  }
);

// route- responds to POST /api/profile/education
// desc-  Add education to Profile
//access- private
router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    Profile.findOne({ user: req.user.id }).then(profile => {
      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to
      };
      profile.education.unshift(newEdu);
      profile.save().then(newprofile => res.json(newprofile));
    });
  }
);

// route- responds to DELETE /api/profile/experience/:exp_id
// desc-  Delete experience from Profile
//access- private
router.delete(
  "/experience/:exp_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        //Get experience and delete
        const removeIndex = profile.experience
          .map(item => item.id)
          .indexOf(req.params.exp_id);

        //splice out od experience array
        if (removeIndex !== -1) {
          profile.experience.splice(removeIndex, 1);
          profile.save().then(updatedprofile => res.json(updatedprofile));
        } else {
          res
            .status(404)
            .json({ delete: "No experience Record found with that ID" });
        }
      })
      .catch(err => res.status(404).json(err));
  }
);

// route- responds to DELETE /api/profile/education/:edu_id
// desc-  Delete education from Profile
//access- private
router.delete(
  "/education/:edu_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        //Get education and delete
        const removeIndex = profile.education
          .map(item => item.id)
          .indexOf(req.params.edu_id);

        //splice out of education array
        if (removeIndex !== -1) {
          profile.education.splice(removeIndex, 1);
          profile.save().then(updatedprofile => res.json(updatedprofile));
        } else {
          res
            .status(404)
            .json({ delete: "No education Record found with that ID" });
        }
      })
      .catch(err => res.status(404).json(err));
  }
);

// route- responds to DELETE /api/profile/
// desc-  Delete current user Profile and the user 
//access- private
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id })
      .then(() => {
        User.findOneAndRemove({_id:req.user.id})
        .then(()=> {
            res.json({success:true})
        })
      })
      .catch(err => res.status(404).json(err));
  }
);
module.exports = router;
