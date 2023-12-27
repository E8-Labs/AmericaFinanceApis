import express from "express";
const plaidRouter = express.Router();
import {verifyJwtToken}  from "../middleware/jwtmiddleware.js";
import {RegisterUser, LoginUser} from "../controllers/user.controller.js";



plaidRouter.post("/register", RegisterUser);
plaidRouter.post("/login", LoginUser);


export default plaidRouter;