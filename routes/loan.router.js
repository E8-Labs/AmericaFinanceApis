import express from "express";
const loanRouter  = express.Router();
import {verifyJwtToken}  from "../middleware/jwtmiddleware.js";


import { GetUserLoansList, RequestLoan, ApproveLoan, RejectLoan, GetAdminLoansList, 
    GetLoanCalculations } from "../controllers/loan.controller.js";


loanRouter.post("/request_loan", verifyJwtToken, RequestLoan);

loanRouter.post("/approve_loan", verifyJwtToken, ApproveLoan);
loanRouter.post("/reject_loan", verifyJwtToken, RejectLoan);
loanRouter.get("/get_user_loans", verifyJwtToken, GetUserLoansList);
loanRouter.get("/get_admin_loans", verifyJwtToken, GetAdminLoansList);
loanRouter.post("/get_loan_calculations", verifyJwtToken, GetLoanCalculations);


export default loanRouter;