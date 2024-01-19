import db from "../models/index.js";
// const S3 = require("aws-sdk/clients/s3");
import JWT from "jsonwebtoken";
import bcrypt from 'bcrypt';
import multer from "multer";
import path from "path";
import UserLoanFullResource from "../resources/loan/loan.resource.js";
import moment from "moment-timezone";

import LoanStatus from "../models/loanstatus.js";
import UserRole from "../models/userrole.js";

import { addDays, currentDate, dateToString } from "../config/utility.js";

import { fetchOrCreateUserToken } from "./plaid.controller.js";

import { GetAccountsListUtility, GetTransferAuthorization, MakeTransferUtility } from "./plaid.controller.js";
// const fs = require("fs");
// var Jimp = require("jimp");
// require("dotenv").config();
const User = db.user;
const Op = db.Sequelize.Op;




import UserProfileFullResource from "../resources/user/userprofilefullresource.js";

const GetUserLoansList = async (req, res) => {
    JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
        if (authData) {
            let offset = req.query.offset;
            let userid = authData.user.id;
            if (typeof req.query.userid !== 'undefined') {
                userid = req.query.userid;
            }
            let loans = await db.LoanModel.findAll({
                where: {
                    UserId: userid
                }
            })
            let list = null;
            if (loans) {
                list = await UserLoanFullResource(loans);
            }
            res.send({ status: true, message: "Loans", data: list })
        }
        else {
            res.send({ status: false, message: "Unauthenticated user", data: null })
        }
    })
}


const GetAdminLoansList = async (req, res) => {
    console.log("Admin api loans called")
    let offset = req.query.offset;
    let loans = await db.LoanModel.findAll()
    let list = null;
    if (loans) {
        list = await UserLoanFullResource(loans);
    }
    res.send({ status: true, message: "Loans", data: list })
    // JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
    //     if (authData ) {
    //         let offset = req.query.offset;
    //         let loans = await db.LoanModel.findAll()
    //         let list = null;
    //         if(loans){
    //             list = await UserLoanFullResource(loans);
    //         }
    //         res.send({ status: true, message: "Loans", data: list })
    //     }
    //     else{
    //         res.send({ status: false, message: "Unauthenticated user", data: null })
    //     }
    // })
}


const RequestLoan = async (req, res) => {
    console.log("Requesting Loan ", req.body.amount_requested)
    JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
        if (authData) {
            let userid = authData.user.id;
            let user = await db.user.findByPk(userid)
            if (user) {
                var loan = {
                    amount_requested: req.body.amount_requested,
                    amount_approved: req.body.amount_requested,
                    UserId: userid,
                    loan_status: LoanStatus.StatusPending,

                };
                try {
                    db.LoanModel.create(loan).then(async data => {
                        console.log("Loan created ", data.id)

                        let loan = await UserLoanFullResource(data);
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
            else {
                res.send({ status: false, message: "user not found", data: authData })
            }
        }
        else {
            res.send({ status: false, message: "Unauthenticated user", data: null })
        }
    })
}


export const GetLoanCalculationsObject = async (loan_amount, user) => {
    let loanTerm = 14; //days
    

        var today = currentDate()
        var loan_due_date = addDays(today, 14)

        var todayString = dateToString(today)
        var loan_due_date_string = dateToString(loan_due_date)


        let amount = loan_amount;//req.body.amount;
        console.log("Loan amount is ", amount);
        console.log("User state is ", user.state);
        let stateModel = await db.SupportedStateModel.findOne({
            where: {
                state_name: user.state || "California",
            }
        })
        if(!stateModel){
            console.log("No state model for user supported ", user.state)
            // res.send({ status: true, message: "Loan not supported in user's state", data: user })
        }

        let stateTierModel = await db.StateTierLoanVariableModel.findOne({where: {
            tier: user.tier,
            SupportedStateModelId: stateModel.id
        }})

        
        //we can check here for min and max loan amounts as well
        let financeFee = stateModel.finance_fee;//17.5; // percent for AL and MS
        // if (user.state == "CA" || user.state == "California") {
        //     financeFee = 15.0; // percent
        // }

        let financeFeeAmount = financeFee * amount / 100 - stateTierModel.waiver_fee;

        let apr = (financeFeeAmount / amount) / loanTerm * 365 * 100;

        let data = {
            apr: apr, principal_amount: amount, finance_fee: financeFeeAmount,
            finance_fee_percentage: financeFee, duration: loanTerm,
            total_due: amount + financeFeeAmount, 
            // user: user,
            current_date: todayString, estimated_due_date: loan_due_date_string,
            tier_based_waiver: stateTierModel.waiver_fee
        }
        return data;
        // res.send({ status: true, message: "Loan details", data: data })

    
    
}


export const GetLoanCalculations = async (req, res) => {
    JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
        if (authData) {
            let userid = authData.user.id;
            if (typeof req.query.userid !== 'undefined') {
                userid = req.query.userid;
            }
            let user = await db.user.findByPk(userid);
            if(user){
                let data = GetLoanCalculationsObject(req.body.amount, user);
                res.send({ status: true, message: "Calculations of loan", data: data })
            }
            else{
                res.send({ status: false, message: "No such user", data: null })
            }
            
        }
        else {
            res.send({ status: false, message: "Unauthenticated user", data: null })
        }
    })
}

//Admin Only
const ApproveLoan = async (req, res) => {
    JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
        if (authData) {
            let loan_id = req.body.loan_id;
            let userid = authData.user.id;
            // if (typeof req.query.userid !== 'undefined') {
            //     userid = req.query.userid;
            // }
            let user = await db.user.findByPk(userid);

            let loan = await db.LoanModel.findByPk(loan_id)
            if (loan) {
                let borrower = await db.user.findByPk(loan.UserId)
                //only admin can do this

                if (user.role === UserRole.RoleAdmin) {
                    //send the payment to the user
                    // once payment is sent change the loan status to approved

                    /*
                        Steps
                        1 - Get User Accounts List
                        2 - If No Accounts, Abort & Send Message
                        3 - Select First account id
                        4 - Create Transfer Authorization
                        5 - Make Transfer
                        6 - Approve Loan
                    */

                    //Step 1 
                    // const accounts = await GetAccountsListUtility(borrower);
                    // //Step 2
                    // if (accounts && accounts.length > 0) {
                    //     //Step 3
                    //     let account_id = accounts[4].account_id;
                    //     console.log("Charge account ", account_id);

                    //     //Step 4
                    //     let tAuth = await GetTransferAuthorization(borrower, loan.amount_requested, account_id, "credit");
                    //     console.log("Transfer Authorization created ", tAuth);
                    //     // res.send({ Auth: tAuth });
                    //     let authID = tAuth.id;
                    //     if (tAuth.decision == "approved") {
                    //         //Step 5
                    //         let transfer = await MakeTransferUtility(borrower, loan, account_id, authID);
                    //         // res.send({Transfer:  transfer});
                            loan.loan_status = LoanStatus.StatusApproved;


                            let saved = await loan.save();
                            if (saved) {
                                //Create Due Dates For Loan
                                //For Now only one payment within 14 days 
                                //so set the due date to 14 days after the current Date
                                let dateDue = moment().add(14, 'days');//.format('MM/DD/YYYY')
                                let dueDateData = {
                                    due_date: dateDue,
                                    amount_due: loan.amount_requested,
                                    LoanModelId: loan.id
                                }
                                let termsCreated = await db.UserLoanDueDateModel.create(dueDateData)
                                res.send({ status: true, message: "Loan approved", data: loan, due_dates: termsCreated })
                            }
                            else {
                                res.send({ status: false, message: "Loan not approved", data: null })
                            }
                    //     }
                    //     else {
                    //         let message = tAuth.decision_rationale.description;
                    //         res.send({ status: false, message: message, data: tAuth })
                    //     }

                    // }
                    // else {
                    //     //Step 2
                    //     res.send({ status: false, message: "No accounts connected", data: borrower })
                    // }


                }
                else {
                    res.send({ status: false, message: "You're not authorized to perform this request", data: null })
                }
            }
            else {
                res.send({ status: false, message: "No such loan", data: null })
            }

        }
        else {
            res.send({ status: false, message: "Unauthenticated user", data: null })
        }
    })
}


//Admin Only
const RejectLoan = async (req, res) => {
    JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
        if (authData) {
            let loan_id = req.body.loan_id;
            let userid = authData.user.id;
            let user = await db.user.findByPk(userid);
            console.log("Loan id is ", loan_id);
            //only admin can do this

            if (user.role === UserRole.RoleAdmin) {
                let loan = await db.LoanModel.findByPk(loan_id)
                if (loan) {
                    loan.loan_status = LoanStatus.StatusRejected;
                    let saved = await loan.save();
                    if (saved) {
                        res.send({ status: true, message: "Loan rejected", data: loan })
                    }
                    else {
                        res.send({ status: false, message: "Some error occurred", data: null })
                    }
                }
                else {
                    res.send({ status: false, message: "Loan not found", data: null })
                }

            }
            else {
                res.send({ status: false, message: "You're not authorized to perform this request", data: null })
            }
        }
        else {
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
export { GetUserLoansList, GetAdminLoansList, RequestLoan, ApproveLoan, RejectLoan }