import db from "../models/index.js";
// const S3 = require("aws-sdk/clients/s3");
import JWT  from "jsonwebtoken";
import bcrypt  from 'bcrypt';
import multer from "multer";
import path from "path";
import { fetchOrCreateUserToken } from "./plaid.controller.js";
// const fs = require("fs");
// var Jimp = require("jimp");
// require("dotenv").config();
const User = db.user;
const Op = db.Sequelize.Op;


import UserRole from "../models/userrole.js";

import UserProfileFullResource from "../resources/user/userprofilefullresource.js";
import HouseFullResource from "../resources/user/house.resource.js";
import UserDebtFullResource from "../resources/loan/debt.resource.js";



const AddDebt = async(req, res)=>{
    JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
        if (authData) {
            const userid = authData.user.id;
            let debt = {
                debt_type: req.body.debt_type,
                monthly_debt_obligation: req.body.monthly_debt_obligation,
                active_pay_day_loan: req.body.active_pay_day_loan,
                active_duty_force: req.body.active_duty_force,
                bankruptcy_min_year: req.body.bankruptcy_min_year,
                bankruptcy_max_year: req.body.bankruptcy_max_year,
                outstanding_debt_type: req.body.outstanding_debt_type,
                lender_name: req.body.lender_name,
                account_number: req.body.account_number,
                monthly_payment: req.body.monthly_payment,
                due_date: req.body.due_date,
                total_balance_amount: req.body.total_balance_amount,
                UserId: userid,
            }

            try {
                db.DebtModel.create(debt).then(async data => {
                    console.log("Debt created ", data.id)
                    // let userToken = fetchOrCreateUserToken(data);
                    // console.log("User Token created in Register ", userToken)
                    // let u = await UserProfileFullResource(data);
                    res.send({ status: true, message: "Debt added", data: await UserDebtFullResource(data) })
                }).catch(error => {
                    console.log("Debt not created")
                    console.log(error)
                    res.send({
                        message:
                            error.message || "Some error occurred while adding the debt.",
                        status: false,
                        data: null
                    });
                })
            }
            catch (error) {
                console.log("Exception ", error)
                console.log("Debt not created")
                console.log(error)
                res.send({
                    message:
                        error.message || "Some error occurred while adding the debt.",
                    status: false,
                    data: null
                });
            }
        }  
        else{
            res.send({ status: false, message: "Unauthenticated user", data: null })
        }
    })
}


const GetDebtList = async(req, res)=>{
    JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
        if (authData) {
            let userid = authData.user.id;
            if (typeof req.query.userid !== 'undefined') {
                userid = req.query.userid;
            }
            let debts = await db.DebtModel.findAll({where:{
                UserId: userid
            }})

            if (debts){
                res.send({ status: true, message: "Debts list ", data: await UserDebtFullResource(debts) })
            }
            else{
                res.send({ status: true, message: "debts list empty", data: null })
            }
        }
        else{
            res.send({ status: false, message: "Unauthenticated user", data: null })
        }
    })
}

export {AddDebt, GetDebtList}