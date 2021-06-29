const mongoose = require("mongoose");
const physicalProfileSchema = new mongoose.Schema({
    heigth: {
        type: Number,
        required: false
    },
    weight: {
        type: Number,
        required: false
    },
    gender: {
        type: String,
        required: false
    },
    age: {
        type: Number,
        required: false
    },
    activity: {
        type: String,
        required: false
    } 
    ,
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
});

const PhysicalProfile = mongoose.model("PhysicalProfile", physicalProfileSchema);

module.exports = PhysicalProfile;