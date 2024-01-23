import express from "express";
const plaidRouter  = express.Router();
import {verifyJwtToken}  from "../middleware/jwtmiddleware.js";
import {CreateLinkToken, GetLiabilities, GetIdentity, ExchangePublicToken, GetPayrolIncome, 
    GetUserBalance, CreateTransferAuthorizeRequest, CreateTransfer,
    GetUserAccounts}  from "../controllers/plaid.controller.js";

// import { getBalance } from "viem/dist/types/actions/public/getBalance.js";



plaidRouter.post("/create_link_token", verifyJwtToken, CreateLinkToken);
plaidRouter.post("/exchange_public_token", verifyJwtToken, ExchangePublicToken);
plaidRouter.post("/payroll_income", verifyJwtToken, GetPayrolIncome);
plaidRouter.post("/user_balance", verifyJwtToken, GetUserBalance);
plaidRouter.get("/user_accounts", verifyJwtToken, GetUserAccounts);
plaidRouter.post("/authorize_transfer", verifyJwtToken, CreateTransferAuthorizeRequest);
plaidRouter.post("/make_transfer", verifyJwtToken, CreateTransfer);
plaidRouter.get("/liabilities", verifyJwtToken, GetLiabilities);
plaidRouter.get("/identity", verifyJwtToken, GetIdentity);





export default plaidRouter;