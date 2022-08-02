const express = require("express");
const router = express.Router();
const optionRouter = require("./option.route");

const defaultRoutes = [
  {
    path: "/api/options",
    route: optionRouter,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
