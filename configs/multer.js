const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ".zip");
  },
});

function fileFilter(req, file, cb) {
  // The function should call `cb` with a boolean
  // to indicate if the file should be accepted

  // To reject this file pass `false`, like so:
  cb(null, false);

  // To accept the file pass `true`, like so:
  cb(null, true);

  // You can always pass an error if something goes wrong:
  cb(new Error("I don't have a clue!"));
}

const upload = multer({ storage: storage });

module.exports = upload;
