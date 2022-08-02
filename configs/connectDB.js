const mongoose = require("mongoose");

module.exports = () => {
  mongoose
    .connect("mongodb://localhost/BTVN_NODEJS-XML")
    .then((result) => {
      console.log("connect database successfully");
    })
    .catch((err) => {
      console.log(err);
    });
};
