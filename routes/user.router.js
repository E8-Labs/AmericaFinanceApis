import express from "express";
const userRouter = express.Router();
import {verifyJwtToken}  from "../middleware/jwtmiddleware.js";
import {RegisterUser, LoginUser, GetUserProfile, 
    UpdateProfile, GetBorrowers, VerificationUpdated,
    AddPaymentSource, ListPaymentSources, SendPasswordResetEmail, ResetPassword} from "../controllers/user.controller.js";



userRouter.post("/register", RegisterUser);
userRouter.post("/login", LoginUser);
userRouter.post("/get_profile", verifyJwtToken, GetUserProfile);
userRouter.post("/update_profile", verifyJwtToken, UpdateProfile);
userRouter.get("/borrowers", verifyJwtToken, GetBorrowers);
userRouter.get("/payment_sources", verifyJwtToken, ListPaymentSources);
userRouter.post("/add_payment_source", verifyJwtToken, AddPaymentSource);
userRouter.post("/identity_updated", VerificationUpdated);
userRouter.post("/send_reset_email", SendPasswordResetEmail);
userRouter.post("/update_password", ResetPassword);


export default userRouter;