const express = require("express");
const Router = express.Router();
const {verifyJwtToken} = require("../middleware/jwtmiddleware");
const {RegisterUser, LoginUser} = require("../controllers/user.controller");



Router.post("/register", RegisterUser);
Router.post("/login", LoginUser);


module.exports = Router;