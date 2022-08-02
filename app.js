const path = require("path");
const express = require("express");
const router = require("./routes");
const app = express();
const port = 8080;
const globalErrorHandler = require("./middlewares/error");
const { connectDB } = require("./configs");

// Third-party middleware
app.use(express.urlencoded({ extended: false }));

// Built-in middleware
app.use(express.static(path.join(__dirname, "public")));

// Application-level middleware - Router-level middleware

app.use(router);

//  Error-handling middleware
app.use(globalErrorHandler);

connectDB();

app.listen(port, () => {
  console.log("listening on port " + port);
});
