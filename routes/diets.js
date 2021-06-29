const express = require("express");
const router = express.Router();
const Plate = require("../models/Plate");
const Diet = require("../models/Diet")
router.get("/create", async (req, res) => {
  try {
    const plates = await Plate.find({}).lean();
    res.render("diets/create", { name: req.user.name, plates: plates });
  } catch (err) {
    console.log(err);
    res.render("error/500");
  }
});

// @route   GETs one diet
// router.get('/:id', ensureAuth, async (req, res) => {
router.get("/:id", async (req, res) => {
  
  try {
    let diet = await Diet.findById(req.params.id)
    .populate('days.value')
    .lean()
    console.log(diet)
    if (!diet) {
      return res.render("error/404");
    }
    res.render("diets/diet", {
      name: diet.name,
      features:diet.features,
      type: diet.type,
      days:diet.days,
      calories: diet.calories
    });
  } catch (err) {
    console.error(err);
    res.render("error/404");
  }
});

module.exports = router;
