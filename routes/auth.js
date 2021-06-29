const express = require("express");
const passport = require("passport");
const router = express.Router();

//@desc Auth with google
// route get /auth/google
router.get("/google", passport.authenticate("google", { scope: ["profile"] }));
//@desc google auth callback
// route get /auth/google/callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);
//@desc Logout
// route get /auth/logut
// router.get('/logout',(req,res)=>{d
//     req.logout()
//     res.redirect('/')
// })
module.exports = router;
