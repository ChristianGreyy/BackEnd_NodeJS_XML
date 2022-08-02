const mongoose = require("mongoose");
const { Schema } = mongoose;

const documentSchema = new Schema(
  {
    fileName: {
      type: String,
      required: true,
    },
    ext: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    pages: {
      type: Number,
      required: true,
    },
  },
  {
    timestamp: true,
  }
);

module.exports = mongoose.model("Document", documentSchema);
