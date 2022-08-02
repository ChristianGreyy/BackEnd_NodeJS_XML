const mongoose = require("mongoose");
const { Schema } = mongoose;

const segmentSchema = new Schema(
  {
    document_id: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    bold: {
      type: Boolean,
      required: true,
    },
    underline: {
      type: Boolean,
      required: true,
    },
    strike: {
      type: Boolean,
      required: true,
    },
    italic: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamp: true,
  }
);

module.exports = mongoose.model("Segment", segmentSchema);
