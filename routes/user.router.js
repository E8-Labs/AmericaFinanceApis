import express from "express";
const plaidRouter = express.Router();
import {verifyJwtToken}  from "../middleware/jwtmiddleware.js";
import {RegisterUser, LoginUser, GetUserProfile} from "../controllers/user.controller.js";



plaidRouter.post("/register", RegisterUser);
plaidRouter.post("/login", LoginUser);
plaidRouter.post("/get_profile", verifyJwtToken, GetUserProfile);

export default plaidRouter;