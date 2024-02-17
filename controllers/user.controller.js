import db from "../models/index.js";
// const S3 = require("aws-sdk/clients/s3");
import JWT from "jsonwebtoken";
import bcrypt from 'bcrypt';
import multer from "multer";
import path from "path";
import axios from "axios";
import { fetchOrCreateUserToken } from "./plaid.controller.js";
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


export const VerificationUpdated = async(req, res) => {

    console.log("Data from verification is ", req.body)

    let idv = req.body.identity_verification_id;
    if (idv === null){
        idv = req.body.id;
    }
    
    let data = JSON.stringify({
        "client_id": process.env.PLAID_CLIENT_ID,
        "secret": process.env.PLAID_SECRET,
        "identity_verification_id": idv
    });
    let userid = null
    if(typeof(req.body.client_user_id) !== 'undefined'){
        userid = Number(req.body.client_user_id);
    }
    let v = null
    let document_idv = null; // data for document idv
    if(userid !== null){ // find the data using the userid. If exists then we just update the data. Otherwise create new
        v = await db.userVerificationModel.findOne({
            where: {
                UserId: userid
            }
        })
    }
    else{
        if(typeof(req.body.documentary_verification) !== 'undefined'){
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
                    
                    city: data.user.address.city,
                    country: data.user.address.country,
                    street: data.user.address.street,
                    street2: data.user.address.street2,
                    region: data.user.address.region,
                    postal_code: data.user.address.postal_code,
                    dob: data.user.date_of_birth,
                    email_address: data.user.email_address,
                    ssn_last4: data.user.id_number.value,
                    family_name: data.user.name.family_name,
                    given_name: data.user.name.given_name,
                    phone: data.user.phone_number,
                    UserId: Number(data.client_user_id),
    
                }

                if(data.documentary_verification != null){
                    vData.face_image = data.documentary_verification.documents[0].images.face;
                    vData.original_front = data.documentary_verification.documents[0].images.original_front;
                    vData.original_back = data.documentary_verification.documents[0].images.original_back;
                    vData.documentary_verification_status = data.documentary_verification.status;
                }
    
                try{
                    if(v){
                        // update the old data
                        db.userVerificationModel.update(vData, {
                            where: {
                                UserId: userid,
                            }
                        }).then((result)=> {
                            console.log("User verification data saved ", result)
                            res.send({status: true, message: "Verification data update", data: v})
                        })
                        .catch((error)=> {
                            console.log("error ver data ", error)
                            res.send({status: true, message: "Verification data update", data: null})
                        })
                    }
                    else{
                        //create new entry. No old entry exists
                        db.userVerificationModel.create(vData).then((result)=> {
                            console.log("User verification data saved ", result)
                            res.send({status: true, message: "Verification data new" , data: result})
                        })
                        .catch((error)=> {
                            console.log("error ver data ", error)
                            res.send({status: true, message: "Verification data new ", data: null})
                        })
                    }
                }
                catch(error){
                    console.log("Exception Ver Data ", error)
                    res.send({status: true, message: "Verification data", data: null})
                }
    
            })
            .catch((error) => {
                console.log(error);
                res.send({status: true, message: "Verification data", data: null})
            });
    // }

    


}