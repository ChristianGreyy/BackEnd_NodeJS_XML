const express = require("express");
const optionsRouter = express.Router();
const { optionController } = require("../controllers");
const { upload } = require("../configs");

optionsRouter.post("/upload", upload.single("file"), optionController.upload);

module.exports = optionsRouter;
