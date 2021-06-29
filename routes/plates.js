const express = require("express");
const router = express.Router();
const Plate = require("../models/Plate");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname + "/../uploads/"));
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

const upload = multer({ storage: storage });

router.get("/list", async (req, res) => {
  try {
    const plates = await Plate.find({}).lean();
    res.render("plates/list", { name: req.user.name, plates: plates });
  } catch (err) {
    console.log(err);
    res.render("error/500");
  }
});
//se carga front de add plates
router.get("/add", (req, res) => {
  res.render("plates/add");
});
//se carga el plate  en la base
router.post("/add", upload.single("file"), (req, res) => {
  const {
    title,
    diet_type,
    food_type,
    calories,
    items,
    directions,
    tips,
    cuisine,
    prep,
  } = req.body;
  let img = {};
  if (req.file != null) {
    img = {
      data: fs.readFileSync(
        path.join(__dirname + "/../uploads/" + req.file.filename)
      ),
      contentType: "image/png",
    };
  } else {
    img = null;
  }

  const plate = new Plate({
    title,
    diet_type,
    food_type,
    calories,
    items,
    directions,
    tips,
    cuisine,
    prep,
    img,
  });
  plate
    .save()
    .then((plate) => {
      req.flash("success_msg", "Plate added to Database");
      res.render("plates/add");
    })
    .catch((err) => console.log(err));
});
// @desc    Edit one plate
// @route   EDIT /plates/:id
router.get("/edit/:id", async (req, res) => {
  try {
    const plate = await Plate.findOne({
      _id: req.params.id,
    }).lean();
    if (!plate) {
      return res.render("error/404");
    }

    res.render("plates/edit", {
      plate,
    });
  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
});
// @desc    Deletes one plate
// @route   DELETE /plates/:id
router.delete("/:id", async (req, res) => {
  try {
    let plate = await Plate.findById(req.params.id).lean();
    console.log(plate);
    if (!plate) {
      return res.render("error/404");
    }
    await Plate.deleteOne({
      _id: req.params.id,
    });
  
    const plates = await Plate.find({}).lean();
    res.render("plates/list", { name: req.user.name, plates: plates });

  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
});

// @desc    Update platuru
// @route   PUT /plate/:id
// router.put('/:id', ensureAuth, async (req, res) => {
router.put("/edit/:id", upload.single("file"), async (req, res) => {
  var {
    title,
    diet_type,
    food_type,
    calories,
    items,
    directions,
    cuisine,
    prep,
    tips,
  } = req.body;
  let updates = {};
  
  if (req.file) {
    var img = {
      data: fs.readFileSync(
        path.join(__dirname + "/../uploads/" + req.file.filename)
      ),
      contentType: "image/png",
    };

    updates = {
      title,
      diet_type,
      food_type,
      calories,
      items,
      directions,
      tips,
      cuisine,
      prep,
      img,
    };
  } else {
    updates = {
      title,
      diet_type,
      food_type,
      calories,
      items,
      directions,
      tips,
      cuisine,
      prep,
    };
  }

  try {
    let plate = await Plate.findById(req.params.id).lean();

    if (!plate) {
      return res.render("error/404");
    }
    plate = await Plate.findOneAndUpdate({ _id: req.params.id }, updates, {
      new: true,
      runValidators: true,
    });
    res.redirect("/plates/list");
  } catch (err) {
    console.error(err);
    console.log(err);
    return res.render("error/500");
  }
});
module.exports = router;
