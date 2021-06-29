const mongoose = require("mongoose");
const PlateSchema = new mongoose.Schema({
  
  title: {
    type: String,
    required: true,
  },
  calories: {
    type: Number,
    required: true,
  },
  diet_type: {
    type: [String],
    required: true,
  },
  food_type: {
    type: String,
    required: true,
  },
  items: {
    type: String,
    required: true,
  },
  directions: {
    type: String,
    required: false,
  },
  tips: {
    type: String,
    required: false,
  },
  cuisine:{
    type: [String],
    required: false,
  },
  prep:{
    type:['Normal','Minimal'],
    required: false
  },
  img: { data: Buffer, contentType: String }
});
module.exports = mongoose.model("Plate", PlateSchema);
