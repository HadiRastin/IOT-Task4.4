const mongoose = require("mongoose");

const sensorSchema = new mongoose.Schema({
  id: Number,
  name: String,
  address: String,
  Sensordata: [
    {
      time: Date,
      temperature: Number,
    },
  ],
});

module.exports = mongoose.model("Sensor", sensorSchema);
