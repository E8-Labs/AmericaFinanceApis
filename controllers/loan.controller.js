import db from "../models/index.js";
// const S3 = require("aws-sdk/clients/s3");
import JWT  from "jsonwebtoken";
import bcrypt  from 'bcrypt';
import multer from "multer";
import path from "path";
import LoanStatus from "../models/loanstatus.js";
import { fetchOrCreateUserToken } from "./plaid.controller.js";
// const fs = require("fs");
// var Jimp = require("jimp");
// require("dotenv").config();
const User = db.user;
const Op = db.Sequelize.Op;


import UserProfileFullResource from "../resources/user/userprofilefullresource.js";



const RequestLoan = async(req, res) => {
    console.log("Requesting Loan ", req.body.amount_requested)
    JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
        if (authData) {
            let userid = authData.user.id;
            let user = await db.user.findByPk(userid)
            if(user){
                var loan = {
                    amount_requested: req.body.amount_requested,
                    amount_approved: req.body.amount_requested,
                    UserId: userid,
                    loan_status: LoanStatus.StatusPending,
        
                };
                try {
                    db.LoanModel.create(loan).then(async data => {
                        console.log("Loan created ", data.id)
                        
                        
                        res.send({ status: true, message: "Loan created", data: data })
                    }).catch(error => {
                        console.log("Loan not created")
                        console.log(error)
                        res.send({
                            message:
                                err.message || "Some error occurred while requesting loan.",
                            status: false,
                            data: null
                        });
                    })
                }
                catch (error) {
                    console.log("Loan not created 2")
                        console.log(error)
                        res.send({
                            message:
                                err.message || "Some error occurred while requesting loan.",
                            status: false,
                            data: null
                        });
                }
            }
            else{
                res.send({ status: false, message: "user not found", data: null })
            }
        }
        else{
            res.send({ status: false, message: "Unauthenticated user", data: null })
        }
    })
}

const ApproveLoan = async(req, res)=>{
    JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
        if (authData) {
            let loan_id = req.body.loan_id;
            let userid = authData.user.id;
            let user = await db.user.findByPk(userid);

            //only admin can do this
        }
        else{
            res.send({ status: false, message: "Unauthenticated user", data: null })
        }
    })
}


// JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
//     if (authData) {
//     }
//     else{
//         res.send({ status: false, message: "Unauthenticated user", data: null })
//     }
// })
export {RequestLoan}