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
        // console.log("Hello bro")
        // res.send("Hello")
        if (!req.body.firstname){
            res.send({ status: false, message: "Firstname is required " , data: null });
        }
        else if (!req.body.lastname){
            res.send({ status: false, message: "Lastname is required " , data: null });
        }
        else{
            var userData = {
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                middlename: req.body.middlename,
                email: req.body.email,
                profile_image: '',
                password: req.body.password,
                role: UserRole.RoleUser,
            };
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(req.body.password, salt);
            userData.password = hashed;

            try {
                User.create(userData).then(async data => {
                    console.log("User created ", data.id)
                    let userToken = fetchOrCreateUserToken(data);
                    console.log("User Token created in Register ", userToken)
                    let user = data
                    JWT.sign({ user }, process.env.SecretJwtKey, { expiresIn: '31536000' }, async(err, token) => {
                        if (err) {
                            console.log("Error signing")
                            res.send({ status: false, message: "Error Token " + err, data: null });
                        }
                        else {
                            console.log("signed creating user")
                            let u = await UserProfileFullResource(data);
                            res.send({ status: true, message: "User registered", data: { user: u, token: token } })
                            
                        }
                    })

                    
                }).catch(error => {
                    console.log("User not created")
                    console.log(error)
                    res.send({
                        message:
                            err.message || "Some error occurred while creating the user.",
                        status: false,
                        data: null
                    });
                })
            }
            catch (error) {
                console.log("Exception ", error)
                console.log("User not created")
                console.log(error)
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
    console.log("Login " + req.body.email);
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findOne({
        where: {
            email: email
        }
    })

    const count = await User.count();
    console.log("Count " + count);
    if (!user) {
        res.send({ status: false, message: "Invalid email", data: null });
    }
    else {


        bcrypt.compare(password, user.password, async function (err, result) {
            // result == true
            if (result) {
                JWT.sign({ user }, process.env.SecretJwtKey, { expiresIn: '31536000' }, async (error, token) => {
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
    // console.log(user);

}


export const UpdateProfile = async(req, res) => {
    JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
        if (authData) {
            console.log("Auth data ", authData)
            let userid = authData.user.id;
            
            const user = await User.findByPk(userid);
            
            let state = req.body.state;
            user.state = state;
            const saved = await user.save();

            let u = await UserProfileFullResource(user)
            res.send({ status: true, message: "User updated", data: u })

        }
        else {
            res.send({ status: false, message: "Unauthenticated user", data: null })
        }
    })
}


export const GetUserProfile = (req, res) => {
    JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
        if (authData) {
            console.log("Auth data ", authData)
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