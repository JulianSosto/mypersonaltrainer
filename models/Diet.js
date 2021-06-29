const mongoose = require("mongoose");
const DietSchema = new mongoose.Schema({
  name: String,
  type: String,
  calories: Number,
  features: [String],
  days:[
        {
          name : {type:String, require:true},
          value : [{type:mongoose.Schema.Types.ObjectId,ref: 'Plate'}]
        }
      ]
  });

const Diet = mongoose.model("Diet", DietSchema);

module.exports = Diet;
