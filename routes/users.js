const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
// Load User model
const User = require("../models/User");
const { forwardAuthenticated } = require("../config/auth");

// Login Page
// router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));
router.get("/login", (req, res) => res.render("login"));

// Register Page
// router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));
router.get("/register", (req, res) => res.render("register"));

// Register
router.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;

  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please enter all fields" });
  }

  if (password != password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Password must be at least 6 characters" });
  }
  console.log(errors);
  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2,
    });
  } else {
    User.findOne({ email: email }).then((user) => {
      if (user) {
        errors.push({ msg: "Email already exists" });
        res.render("register", {
          errors,
          name,
          email,
          password,
          password2,
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then((user) => {
                req.flash(
                  "success_msg",
                  "You are now registered and can log in"
                );
                res.redirect("/users/login");
              })
              .catch((err) => console.log(err));
          });
        });
      }
    });
  }
});
//Para resetear campos de usuario nombre mail.
router.put("/edit/:id", async (req, res) => {
  console.log(req.body)

    try {
      let user = await User.findById(req.params.id).lean();

      if (!user) {
        return res.render("error/404");
      }

     await User.findOneAndUpdate({ _id: req.params.id }, req.body, {
      new: true,
      runValidators: true,
    });

    res.redirect("/dashboard")
  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
});

//recoverpass
router.get("/recoverpass/:id", async (req, res, next) => {
  console.log(req.params)
    try {
      const user = await User.findById({ _id: req.params.id }).lean()

      if (user) {
        currentpassword = user.password
        console.log(currentpassword)
      }
      res.render("recoverpass")
    } catch (error) {
      console.error(error);
      return res.render("error/500");
    }
})
//recoverpass
router.get("/changepass", async (req, res, next) => {

  try {
      const user = await User.findById({ _id: req.body.id }).lean()

      if (user) {
        currentpassword = user.password
        console.log(currentpassword)
      }
      res.render("changepass")
    } catch (error) {
      console.error(error);
      return res.render("error/500");
    }
})
router.put("/changepass/:id", async (req, res, next) => {
  console.log(req.body)
    try {
      const user = await User.findById({ _id: req.params.id }).lean()

      if (user) {
        currentpassword = user.password
        console.log(currentpassword)
      }
      res.render("changepass")
    } catch (error) {
      console.error(error);
      return res.render("error/500");
    }
})
// Login

router.post("/login", (req, res, next) => {

  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

// Logout
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/users/login");
});


module.exports = router;




