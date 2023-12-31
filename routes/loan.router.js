import express from "express";
const loanRouter  = express.Router();
import {verifyJwtToken}  from "../middleware/jwtmiddleware.js";


import { GetUserLoansList, RequestLoan, ApproveLoan, RejectLoan } from "../controllers/loan.controller.js";


loanRouter.post("/request_loan", verifyJwtToken, RequestLoan);

loanRouter.post("/approve_loan", verifyJwtToken, ApproveLoan);
loanRouter.post("/reject_loan", verifyJwtToken, RejectLoan);
loanRouter.get("/get_user_loans", verifyJwtToken, GetUserLoansList);



export default loanRouter;