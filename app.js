const mongoose = require("mongoose");
var plotly = require("plotly")("hadirastin88", "4RXSGeDDgLgLdoknDVdU");
const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");
const Sensor = require("./models/sensor");

var data = {
  x: [],
  y: [],
  type: "scatter",
};

//conncet to Aurduino and retrive data
const port = new SerialPort("COM3", { baudRate: 9600 });
const parser = port.pipe(new Readline({ delimiter: "\n" }));
let newData;

parser.on("data", (data) => {
  try {
    const parsedData = JSON.parse(data);
    console.log("Received data from Arduino:", parsedData);

    newData = {
      time: Date.now(),
      temperature: parsedData.temperature,
    };
  } catch (error) {
    console.error("Error parsing data from Arduino:", error);
  }
});

//conncet to database
mongoose.connect(
  "mongodb+srv://hadirastin88:1402.Hildahailin@sit314.ongpndv.mongodb.net/data",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// test the connection
const db = mongoose.connection;
db.on("error", (error) => {
  console.error("MongoDB connection error:", error);
});

db.once("open", async () => {
  console.log("Connected to MongoDB database");

  try {
    // create an instance if there is no instance
    let sensorInstance = await Sensor.findOne({ id: 0 });

    if (!sensorInstance) {
      const newSensor = new Sensor({
        id: 0,
        name: "temperaturesensor",
        address: "221 Burwood Hwy, Burwood VIC 3125",
        Sensordata: [],
      });

      sensorInstance = await newSensor.save();
      console.log("Created new sensor instance");
    }

    function updateDataPoint() {
      const newData = {
        time: new Date(),
        temperature: parsedData.temperature,
      };

      sensorInstance.Sensordata.push(newData);

      sensorInstance
        .save()
        .then(() => {
          console.log("Sensor instance updated with new Sensordata");
        })
        .then(() => {
          data.x.push(newData.time.toISOString());
          data.y.push(newData.temperature);
          var graphOptions = {
            filename: "iot-performance",
            fileopt: "overwrite",
          };
          plotly.plot(data, graphOptions, function (err, msg) {
            if (err) return console.log(err);
            console.log(msg);
          });
        })
        .catch((error) => {
          console.error("Error saving sensor instance:", error);
        });
    }

    setInterval(async () => {
      try {
        await updateDataPoint();
      } catch (error) {
        console.error("Error in setInterval:", error);
      }
    }, 1000);
  } catch (error) {
    console.error("Error finding sensor instance:", error);
  }
});
