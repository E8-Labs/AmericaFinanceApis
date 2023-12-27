import express from "express";
const loanRouter  = express.Router();
import {verifyJwtToken}  from "../middleware/jwtmiddleware.js";


import { RequestLoan } from "../controllers/loan.controller.js";


loanRouter.post("/request_loan", verifyJwtToken, RequestLoan);



export default loanRouter;