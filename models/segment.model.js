const mongoose = require("mongoose");
const { Schema } = mongoose;

const segmentSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    bold: {
      type: Boolean,
      required: false,
    },
    underline: {
      type: Boolean,
      required: false,
    },
    strike: {
      type: Boolean,
      required: false,
    },
    italic: {
      type: Boolean,
      required: false,
    },
  },
  {
    timestamp: true,
  }
);

module.exports = mongoose.model("Segment", segmentSchema);
