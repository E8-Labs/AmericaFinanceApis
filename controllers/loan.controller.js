import db from "../models/index.js";
// const S3 = require("aws-sdk/clients/s3");
import JWT  from "jsonwebtoken";
import bcrypt  from 'bcrypt';
import multer from "multer";
import path from "path";
import UserLoanFullResource from "../resources/loan/loan.resource.js";

import LoanStatus from "../models/loanstatus.js";
import UserRole from "../models/userrole.js";

import { fetchOrCreateUserToken } from "./plaid.controller.js";
// const fs = require("fs");
// var Jimp = require("jimp");
// require("dotenv").config();
const User = db.user;
const Op = db.Sequelize.Op;




import UserProfileFullResource from "../resources/user/userprofilefullresource.js";

const GetUserLoansList = async(req, res)=>{
    JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
        if (authData) {
            let offset = req.query.offset;
            let loans = await db.LoanModel.findAll({where:{
                UserId: authData.user.id
            }})
            let list = null;
            if(loans){
                list = await  UserLoanFullResource(loans);
            }
            res.send({ status: true, message: "Loans", data: list })
        }
        else{
            res.send({ status: false, message: "Unauthenticated user", data: null })
        }
    })
} 


const GetAdminLoansList = async(req, res)=>{
    console.log("Admin api loans called")
    let offset = req.query.offset;
            let loans = await db.LoanModel.findAll()
            let list = null;
            if(loans){
                list = await  UserLoanFullResource(loans);
            }
            res.send({ status: true, message: "Loans", data: list })
    // JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
    //     if (authData ) {
    //         let offset = req.query.offset;
    //         let loans = await db.LoanModel.findAll()
    //         let list = null;
    //         if(loans){
    //             list = await  UserLoanFullResource(loans);
    //         }
    //         res.send({ status: true, message: "Loans", data: list })
    //     }
    //     else{
    //         res.send({ status: false, message: "Unauthenticated user", data: null })
    //     }
    // })
}


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
                        
                        let loan = await  UserLoanFullResource(data);
                        res.send({ status: true, message: "Loan created", data: loan })
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
                res.send({ status: false, message: "user not found", data: authData })
            }
        }
        else{
            res.send({ status: false, message: "Unauthenticated user", data: null })
        }
    })
}

//Admin Only
const ApproveLoan = async(req, res)=>{
    JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
        if (authData) {
            let loan_id = req.body.loan_id;
            let userid = authData.user.id;
            let user = await db.user.findByPk(userid);

            //only admin can do this

            if(user.role === UserRole.RoleAdmin){
                //send the payment to the user
                // once payment is sent change the loan status to approved
                let loan = await db.LoanModel.findByPk(loan_id)
                loan.loan_status = LoanStatus.StatusApproved;
                let saved = await loan.save();
                if (saved){
                    res.send({ status: true, message: "Loan approved", data: loan })
                }
                else{
                    res.send({ status: false, message: "Loan not approved", data: null })
                }

            }
            else{
                res.send({ status: false, message: "You're not authorized to perform this request", data: null })
            }
        }
        else{
            res.send({ status: false, message: "Unauthenticated user", data: null })
        }
    })
}


//Admin Only
const RejectLoan = async(req, res)=>{
    JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
        if (authData) {
            let loan_id = req.body.loan_id;
            let userid = authData.user.id;
            let user = await db.user.findByPk(userid);

            //only admin can do this

            if(user.role === UserRole.RoleAdmin){
                let loan = await db.LoanModel.findByPk(loan_id)
                if(loan){
                    loan.loan_status = LoanStatus.StatusRejected;
                    let saved = await loan.save();
                    if(saved){
                        res.send({ status: true, message: "Loan rejected", data: loan })
                    }
                    else{
                        res.send({ status: false, message: "Some error occurred", data: null })
                    }
                }
                else{
                    res.send({ status: false, message: "Loan not found", data: null })
                }

            }
            else{
                res.send({ status: false, message: "You're not authorized to perform this request", data: null })
            }
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
export {GetUserLoansList, GetAdminLoansList, RequestLoan, ApproveLoan, RejectLoan}