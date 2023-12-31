import express from "express";
const houseRouter  = express.Router();
import {verifyJwtToken}  from "../middleware/jwtmiddleware.js";
import { AddHouse, GetHouseList } from "../controllers/house.controller.js";
// import { getBalance } from "viem/dist/types/actions/public/getBalance.js";



houseRouter.post("/add_house", verifyJwtToken, AddHouse);
houseRouter.get("/get_houses_list", verifyJwtToken, GetHouseList);





export default houseRouter;