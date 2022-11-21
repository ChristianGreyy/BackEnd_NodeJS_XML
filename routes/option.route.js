const express = require("express");
const optionsRouter = express.Router();
const { optionController } = require("../controllers");
const { upload } = require("../configs");

optionsRouter.post("/upload", upload.single("file"), optionController.upload);
optionsRouter.post("/save", upload.single("file"), optionController.save);
optionsRouter.get("/:documentId", optionController.getDoducmentById);
optionsRouter.post("/writeFile", optionController.writeFile);
optionsRouter.patch("/update", optionController.update);

module.exports = optionsRouter;
