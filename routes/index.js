const express = require("express");
const router = express.Router();
const { ensureAuth, ensureGuest } = require("../middleware/auth");
const Diet = require("../models/Diet");
const Plate = require("../models/Plate");
const Profile = require("../models/PhysicalProfile");
const User = require("../models/User");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const bcrypt = require("bcryptjs");
const { populate } = require("../models/Plate");

//@desc login/landing
// route get /
// router.get('/', ensureGuest , (req,res) => {
router.get("/", (req, res) => {
  //res.render('login', {layout: 'login'});
  if (req.isAuthenticated()) {
    name = true;
  } else {
    name = false;
  }
  res.render("index", {
    name,
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    layout: "landing",
  });
});
//@desc Dashboard

// route get /dashboard
// router.get('/dashboard', ensureAuth, async (req,res) => {
router.get("/dashboard", async (req, res) => {
  try {
    const user = await User.findById({
      _id: req.user.id,
    })
      .populate("profile")
      .populate("diet")
      .lean();

    console.log(user.diet)
    if (user.permission === undefined) {
      if (user.diet != null) {

        for (const day of user.diet.days) {
          let arr = [];
          for (let id of day.value) {
            const plates = await Plate.findById(id).lean();
            
            arr.push(plates);
          }
          
          day.value = arr;
        }
        res.render("dashboard", {
          profile: user.profile,
          diet_name: user.diet.name,
          diet_features: user.diet.features,
          diet_calories:user.diet.calories,
          days:user.diet.days,
          name: req.user.name,
          email: req.user.email,
          _id: req.user._id,
        });
      }else {
        res.render("dashboard", {
          profile: user.profile,
          name: req.user.name,
          email: req.user.email,
          _id: req.user._id,
        });
      }
      
    } else {
      res.redirect("admin");
    }
  } catch (err) {
    console.log(err);
    res.render("error/500");
  }
});

// el post de la compra
router.post("/checkout", async (req, res) => {
  let errors = [];
  const {
    age,
    weight,
    height,
    activity,
    input_sex,
    input_goal,
    input_diet,
    input_subscription,
  } = req.body;

  // After all this is done, the variables imputed should be:
  const bmr = 0;
   // If Male than: 
  // BMR=10xweight+6.25xheight-5xage+5
  if (input_sex === "male") {
    if (activity != "high") {
      bmr = weight * 10 + 6.25 * height - 5 * (age - 5);
      console.log(bmr);
    } else {
      bmr = weight * 10 + 6.25 * height - 5 * (age - 5) + 155;
    }
  } else if (input_sex === "female") {
    // If Female
    //  10xweight+6.25xheight-5xage-161
    bmr = weight * 10 + 6.25 * height - 5 * (age - 161);
  }
  

 
  // If Male high activity:
  // Male BMR+155
  
  // If Female High Intensity than:
  // Female BMR +155
  // If Gender Neutral
  // 10xweight+6.25xheight-5xage-70
  
  // If Gender Neutral Active
  // 10xweight+6.25xheight-5xage-70+155
  
  // From these answers we would need also the following Calculation to get the final number we want:
  
  
  // If Fat Loss Than BMR -20%
  // If Extreme Fat Loss Than BMR -30%
  // If Lean Muscle Gain = BMR
  // If Weight Gain= BMR +35%
  
  // From these variables we can get the rest. Heres how.
  
  // If BMR is Less than 1200 Than contact us.
  // If BMR is Above 2500 than Contact us.
  
  // If BMR is in between these ranges than next screen.
  const bim = 0;
  const amount = 2500;
  if (!req.isAuthenticated()) {
    console.log("no-logea3");
    const name = "new user";
    const password = "myPTUser";
    const permission = undefined;

    diet = await Diet.findOne({
      type: input_diet,
      name: "1700 Calories Diet",
    }).lean();
    User.findOne({ email: req.body.stripeEmail }).then((user) => {
      if (user) {
        errors.push({
          msg: "Email already exists, please make the buy from your dashboard",
        });
      } else {
        const newProfile = new Profile({
          heigth: height,
          weight,
          gender: input_sex,
          age,
          activity,
        })
          .save()
          .then((profile) => {
            const id = profile._id;
            console.log(id);

            const newUser = new User({
              name,
              email: req.body.stripeEmail,
              password,
              permission,
              profile: id,
              diet: diet,
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
                      "You are now registered and can log in with your email, your password is 'myPTUser'"
                    );
                    stripe.customers
                      .create({
                        email: req.body.stripeEmail,
                        source: req.body.stripeToken,
                      })
                      .then((customer) =>
                        stripe.charges.create({
                          amount,
                          description: "Your diet for user",
                          currency: "eur",
                          customer: customer.id,
                        })
                      )
                      .then((charge) => res.redirect("/users/login"));
                  })
                  .catch((err) => console.log(err));
              });
            });
          });
      }
    });
  }
});

//CON ESTO SE LLEGA  A LA PAGINA PARA CARGAR LA DIETA
router.get("/chargeDiet", async (req, res) => {
  req.flash("success_msg", "Adding new diet");
  const diet = await Diet.findOne({ name: "Diet name" });
  const week1 = [];
  const week2 = [];
  for (let i = 0; i < diet.days.length; i++) {
    if (i > 6) {
      week2.push(diet.days[i]);
    } else {
      week1.push(diet.days[i]);
    }
  }

  res.render("diets/add", {
    type: diet.type,
    name: diet.name,
    features: diet.features,
    week1: week1,
    week2: week2,
  });
});

//CON ESTO SE CARGA LA DIETA. SE POSTEA EL REQ A LA BASE DE DATOS.
router.post("/createDiet", (req, res) => {
  const { name, diet_type, features, calories, savedDays } = req.body;
  console.log(req.body);

  console.log(JSON.parse(savedDays));
  for (let index = 0; index < savedDays.length; index++) {
    const element = savedDays[index];
  }
  const newDiet = new Diet({
    name,
    type: diet_type,
    calories,
    features,
    days: JSON.parse(savedDays),
  });
  console.log(newDiet);
  newDiet
    .save()
    .then((newDiet) => {
      req.flash("success_msg", "Diet charged!");
      res.redirect("admin");
    })
    .catch((err) => console.log(err));
});

// Admin.hbs
router.get("/admin", async (req, res) => {
  console.log(req.user._id)
  const diets = await Diet.find().lean();

  if (req.user.permission !== undefined) {
    res.render("admin", {
      
      name: req.user.name,
      _id:req.user._id,
      email: req.user.email,
      diets,
    });
  } else {
    res.redirect("dashboard");
  }
});

router.delete("/:id", async (req, res) => {
  try { 
    let diet = await Diet.findById(req.params.id).lean();

    if (!diet) {
      return res.render("error/404");
    }
    await Diet.remove({
      _id: req.params.id,
    });
    res.redirect("/admin");
  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
});
// @desc    Show edit page
// @route   GET /diet/edit/:id
router.get("/edit/:id", async (req, res) => {
  
  try {
    const diet = await Diet.findOne({
      _id: req.params.id,
    }).populate('days.value').lean();
    // const altPlates = await Plate.find({ diet_type : diet.type}).lean();
    // if (!diet) {
    //   return res.render("error/404");
    // }
    res.render("diets/edit", {
      id: diet._id,
      type: diet.type,
      name: diet.name,
      features: diet.features,
      calories: diet.calories,
      days: diet.days,
      // altPlates
    });
  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
});

// @desc    Update diet
// @route   PUT /diet/:id
// router.put('/:id', ensureAuth, async (req, res) => {
router.put("/:id", ensureAuth, async (req, res) => {
  try {
    console.log(req.body);
    let diet = await Diet.findById(req.params.id).lean();

    if (!diet) {
      return res.render("error/404");
    }
    diet = await Diet.findOneAndUpdate({ _id: req.params.id }, req.body, {
      new: true,
      runValidators: true,
    });
    res.redirect("/admin");
  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
});

router.put("/profile/:id", async (req, res) => {
  
  try {
    let profile = await Profile.findById(req.params.id).lean();

    if (!profile) {
      return res.render("error/404");
    }
    profile = await Profile.findOneAndUpdate({ _id: req.params.id }, req.body, {
      new: true,
      runValidators: true,
    });
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
});
module.exports = router;
