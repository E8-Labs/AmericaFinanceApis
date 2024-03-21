import db from "../models/index.js";
// const S3 = require("aws-sdk/clients/s3");
import JWT from "jsonwebtoken";
import bcrypt from 'bcrypt';
import multer from "multer";
import path from "path";
import axios from "axios";
import { fetchOrCreateUserToken } from "./plaid.controller.js";
import nodemailer from 'nodemailer'
// const fs = require("fs");
// var Jimp = require("jimp");
// require("dotenv").config();
const User = db.user;
const Op = db.Sequelize.Op;


import UserRole from "../models/userrole.js";

import UserProfileFullResource from "../resources/user/userprofilefullresource.js";

export const RegisterUser = async (req, res) => {


    // res.send({data: {text: "kanjar Students"}, message: "Chawal Students", status: true})

    const alreadyUser = await User.findOne({
        where: {
            email: req.body.email
        }
    })
    if (alreadyUser) {
        res.send({ status: false, message: "Email already taken ", data: null });
    }
    else {
        // //console.log("Hello bro")
        // res.send("Hello")
        if (!req.body.firstname) {
            res.send({ status: false, message: "Firstname is required ", data: null });
        }
        else if (!req.body.lastname) {
            res.send({ status: false, message: "Lastname is required ", data: null });
        }
        else {
            var userData = {
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                middlename: req.body.middlename,
                email: req.body.email,
                profile_image: '',
                password: req.body.password,
                role: UserRole.RoleUser,
                tier: 0,
                liabilities_added: false
            };
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(req.body.password, salt);
            userData.password = hashed;

            try {
                User.create(userData).then(async data => {
                    //console.log("User created ", data.id)
                    let userToken = fetchOrCreateUserToken(data);
                    //console.log("User Token created in Register ", userToken)
                    let user = data
                    JWT.sign({ user }, process.env.SecretJwtKey, { expiresIn: '365d' }, async (err, token) => {
                        if (err) {
                            //console.log("Error signing")
                            res.send({ status: false, message: "Error Token " + err, data: null });
                        }
                        else {
                            //console.log("signed creating user")
                            let u = await UserProfileFullResource(data);
                            res.send({ status: true, message: "User registered", data: { user: u, token: token } })

                        }
                    })


                }).catch(error => {
                    //console.log("User not created")
                    //console.log(error)
                    res.send({
                        message:
                            err.message || "Some error occurred while creating the user.",
                        status: false,
                        data: null
                    });
                })
            }
            catch (error) {
                //console.log("Exception ", error)
                //console.log("User not created")
                //console.log(error)
                res.send({
                    message:
                        err.message || "Some error occurred while creating the user.",
                    status: false,
                    data: null
                });
            }


        }

    }

}


export const LoginUser = async (req, res) => {
    // res.send("Hello Login")
    //console.log("Login " + req.body.email);
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findOne({
        where: {
            email: email
        }
    })

    const count = await User.count();
    //console.log("Count " + count);
    if (!user) {
        res.send({ status: false, message: "Invalid email", data: null });
    }
    else {


        bcrypt.compare(password, user.password, async function (err, result) {
            // result == true
            if (result) {
                JWT.sign({ user }, process.env.SecretJwtKey, { expiresIn: '365d' }, async (error, token) => {
                    if (error) {

                    }
                    else {
                        let u = await UserProfileFullResource(user);
                        res.send({ data: { user: u, token: token }, status: true, message: "Logged in" });
                    }
                })
            }
            else {
                res.send({ status: false, message: "Invalid password", data: null });
            }
        });
    }
    // //console.log(user);

}


export const UpdateProfile = async (req, res) => {
    JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
        if (authData) {
            //console.log("Auth data ", authData)
            let userid = authData.user.id;

            const user = await User.findByPk(userid);

            let state = req.body.state;
            user.state = state;
            if (typeof req.body.active_payday_loan !== 'undefined') {
                user.active_payday_loan = req.body.active_payday_loan;
            }
            if (typeof req.body.active_duty_manual !== 'undefined') {
                user.active_duty_manual = req.body.active_duty_manual;
            }
            if (typeof req.body.bankruptcy_status !== 'undefined') {
                user.bankruptcy_status = req.body.bankruptcy_status;
            }
            const saved = await user.save();

            let u = await UserProfileFullResource(user)
            res.send({ status: true, message: "User updated", data: u, userData: req.body })

        }
        else {
            res.send({ status: false, message: "Unauthenticated user", data: null })
        }
    })
}




export const GetUserProfile = (req, res) => {
    JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
        if (authData) {
            //console.log("Auth data ", authData)
            let userid = authData.user.id;
            if (typeof req.query.userid !== 'undefined') {
                userid = req.query.userid;
            }
            const user = await User.findByPk(userid);
            if (user) {
                let u = await UserProfileFullResource(user);
                res.send({ status: true, message: "Profile ", data: u })
            }
            else {
                res.send({ status: false, message: "No Profile found", data: null })
            }

        }
        else {
            res.send({ status: false, message: "Unauthenticated user", data: null })
        }
    })
}


export const GetBorrowers = (req, res) => {
    JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
        if (authData) {
            //console.log("Auth data ", authData)
            let userid = authData.user.id;
            let offset = 0;
            if (typeof req.query.offset !== 'undefined') {
                offset = req.query.offset;
            }
            const user = await User.findAll({
                where: {
                    role: {
                        [Op.ne]: UserRole.RoleAdmin
                    }
                }
            });
            if (user) {
                let u = await UserProfileFullResource(user);
                res.send({ status: true, message: "Profiles ", data: u })
            }
            else {
                res.send({ status: false, message: "No Profile found", data: null })
            }

        }
        else {
            res.send({ status: false, message: "Unauthenticated user", data: null })
        }
    })
}


export const VerificationUpdated = async (req, res) => {

    console.log("Data from verification is ", req.body)

    let idv = req.body.identity_verification_id;
    if (idv === null) {
        console.log("identity_verification_id is null")
        idv = req.body.id;
    }

    let data = JSON.stringify({
        "client_id": process.env.PLAID_CLIENT_ID,
        "secret": process.env.PLAID_SECRET,
        "identity_verification_id": idv
    });
    let userid = null
    if (typeof (req.body.client_user_id) !== 'undefined') {
        userid = Number(req.body.client_user_id);
    }
    let v = null
    let document_idv = null; // data for document idv
    if (userid !== null) { // find the data using the userid. If exists then we just update the data. Otherwise create new
        v = await db.userVerificationModel.findOne({
            where: {
                UserId: userid
            }
        })
    }
    else {
        if (typeof (req.body.documentary_verification) !== 'undefined') {
            // have documentary verification: may not need
        }
        v = await db.userVerificationModel.findOne({
            where: {
                idv: idv
            }
        })
    }
    // if(v){
    //     res.send({status: true, message: "Verification data", data: v})
    // }
    // else{
    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://sandbox.plaid.com/identity_verification/get',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    axios.request(config)
        .then((response) => {
            let data = response.data;
            console.log(JSON.stringify(data));
            let vData = {
                client_user_id: data.client_user_id,
                completed_at: data.completed_at,

                idv: idv,
                kyc_check_status: data.kyc_check.status,
                risk_check_status: data.risk_check.status,
                selfie_check_status: data.selfie_check,
                template_used: data.template.id,

                city: data.user.address ? data.user.address.city : '',
                country: data.user.address ? data.user.address.country : '',
                street: data.user.address ? data.user.address.street : '',
                street2: data.user.address ? data.user.address.street2 : '',
                region: data.user.address ? data.user.address.region : '',
                postal_code: data.user.address ? data.user.address.postal_code : '',
                dob: data.user.date_of_birth,
                email_address: data.user.email_address,
                ssn_last4: data.user.id_number ? data.user.id_number.value : '',
                family_name: data.user.name ? data.user.name.family_name : '',
                given_name: data.user.name ? data.user.name.given_name : '',
                phone: data.user.phone_number,
                UserId: Number(data.client_user_id),

            }

            if (data.documentary_verification != null) {
                vData.face_image = data.documentary_verification.documents[0].images.face;
                vData.original_front = data.documentary_verification.documents[0].images.original_front;
                vData.original_back = data.documentary_verification.documents[0].images.original_back;
                vData.documentary_verification_status = data.documentary_verification.status;
            }

            try {
                if (v) {
                    // update the old data
                    db.userVerificationModel.update(vData, {
                        where: {
                            UserId: userid,
                        }
                    }).then((result) => {
                        console.log("User verification data saved ", result)
                        res.send({ status: true, message: "Verification data update", data: v })
                    })
                        .catch((error) => {
                            console.log("error ver data ", error)
                            res.send({ status: true, message: "Verification data update", data: null, exception: error })
                        })
                }
                else {
                    //create new entry. No old entry exists
                    db.userVerificationModel.create(vData).then((result) => {
                        console.log("User verification data saved ", result)
                        res.send({ status: true, message: "Verification data new", data: result })
                    })
                        .catch((error) => {
                            console.log("error ver data ", error)
                            res.send({ status: true, message: "Verification data new create v model ", data: null, exception: error })
                        })
                }
            }
            catch (error) {
                console.log("Exception Ver Data ", error)
                res.send({ status: true, message: "Verification data inner", data: null, exception: error })
            }

        })
        .catch((error) => {
            console.log(error);
            res.send({ status: true, message: "Verification data outer ", data: null, exception: error })
        });
    // }
}




//add bank account maually

async function checkValidAccount(routing) {
    let queryUrl = "https://sandbox.api.payliance.com/api/v1/echeck/queryinstitution"
    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: queryUrl,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer U01hamlkOlVDWDBFMG9KTmtzWWc5aE92bndPKzdEL3FDVExjeUY5RnZWRVNYUlcyS2RydzZsMHMybk1GVWo4Q1dJUjhHNEhFaGJqaU0yYVZoU1dLUzZLZ3VnUHh3b2ZSWDlLaXVSN25yRVgveHcwZHFjb3VYdGpsZmJwZWlFT0dyMjZJRjdhc1dIeENOMXp3VGpvK0NoTnNZMlFFdmpjL1ltODNuZzJtYmIrbFRZbVVoZmc0NUVKNlUyaE1qSzZ0RE9wREdJdjRYc25WTWJqY2ZxTDRXRE01RVF6cnlLREZpMm1YVnVuNllxczUrYjNrVHF0NUpnYXNYNEVwcVdoRnJ5YXg3SlQ='
        },
        data: JSON.stringify({ routing: routing })
    };

    try {
        let response = await axios.request(config);
        if (response) {
            let json = response.data;//await response.json()
            console.log(json)
            if (json.successful === true) {
                return json;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }
    catch (error) {
        console.log("Exception ", error)
        return false;
    }

}
export const AddPaymentSource = async (req, res) => {
    JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
        if (authData) {
            //console.log("Auth data ", authData)
            let userid = authData.user.id;

            const user = await User.findByPk(userid);
            let isDefault = req.body.is_default;

            if (isDefault === true) {
                db.UserPaymentSourceModel.update(
                    { is_default: false }, // Set isDefault to false
                    { where: { UserId: userid } } // Condition for the update
                )
            }

            let routingCheck = await checkValidAccount(req.body.routing_number);
            console.log("Routing check ", routingCheck)
            if (routingCheck === false) {
                console.log("Invalid routing number")
                res.send({ status: false, message: "Invalid routing number", data: null })
            }
            else {
                if (routingCheck.achEligible) {
                    let bank = routingCheck.bank;
                    if (false) {//(bank !== req.body.bank_name){
                        res.send({ status: false, message: "Routing number does not match the bank provided", data: null })
                    }
                    else {
                        let data = {
                            bank_name: bank,
                            routing_number: req.body.routing_number,
                            account_number: req.body.account_number,
                            account_type: req.body.account_type,
                            UserId: userid,
                            is_default: isDefault,
                        }

                        const saved = await db.UserPaymentSourceModel.create(data);

                        let u = await UserProfileFullResource(user)
                        res.send({ status: true, message: "Bank Added", data: u, bank: saved })
                    }

                }
                else {
                    res.send({ status: false, message: "This account is not eligible for ach payments", data: null })
                }

            }


        }
        else {
            res.send({ status: false, message: "Unauthenticated user", data: null })
        }
    })
}


//add bank account maually
export const ListPaymentSources = async (req, res) => {
    JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
        if (authData) {
            //console.log("Auth data ", authData)
            let userid = authData.user.id;

            const user = await User.findByPk(userid);

            const sources = await db.UserPaymentSourceModel.findAll({
                where: {
                    UserId: userid
                }
            });

            // let u = await UserProfileFullResource(user)
            res.send({ status: true, message: "Banks List", data: sources })

        }
        else {
            res.send({ status: false, message: "Unauthenticated user", data: null })
        }
    })
}



function generateRandomCode(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }


export const SendPasswordResetEmail = (req, res) => {
    let email = req.body.email;
    let user = db.user.findOne({
      where: {
        email: email
      }
    })
    if (user) {
      //send email here
      // Create a transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com", // Replace with your mail server host
        port: 587, // Port number depends on your email provider and whether you're using SSL or not
        secure: false, // true for 465 (SSL), false for other ports
        auth: {
          user: "salman@e8-labs.com", // Your email address
          pass: "uzmvwsljflyqnzgu", // Your email password
        },
      });
      const randomCode = generateRandomCode(6);
      db.passwordResetCode.destroy({
        where:{
          email: email
        }
      })
      db.passwordResetCode.create({
        email: email,
        code: `${randomCode}`
      })
      // Setup email data with unicode symbols
      let mailOptions = {
        from: '"America Finance" salman@e8-labs.com', // Sender address
        to: email, // List of recipients
        subject: "Password Reset Code", // Subject line
        text: `${randomCode}`, // Plain text body
        html: `<html><b>Hello,</b>This is your reset code.${randomCode} </html>`, // HTML body
      };
  
      // Send mail with defined transport object
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          res.send({status: false, message: "Code not sent"})
           console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        res.send({status: true, message: "Code sent"})
        // Preview only available when sending through an Ethereal account
        
      });
    }
    else {
      res.send({ status: false, data: null, message: "No such user" })
    }
  }
  
  export const ResetPassword = async (req, res)=>{
    let email = req.body.email;
    let password = req.body.password;
    let code = req.body.code;
  
    let dbCode = await db.passwordResetCode.findOne({
      where: {
        email: email
      }
    })
  
    if(dbCode && dbCode.code === code){
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);
      let user = await db.user.findOne({
        where: {
          email: email
        }
      })
      user.password = hashed;
      let saved = await user.save();
      if(saved){
        res.send({ status: true, data: null, message: "Password updated" })
      }
      else{
        res.send({ status: false, data: null, message: "Error updating password" })
      }
    }
    else{
      res.send({ status: false, data: null, message: "Incorrect code" })
    }
  }