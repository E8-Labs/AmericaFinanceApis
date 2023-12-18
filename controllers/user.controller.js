const db = require("../models");
// const S3 = require("aws-sdk/clients/s3");
const JWT = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const multer = require("multer");
const path = require("path");
// const fs = require("fs");
// var Jimp = require("jimp");
require("dotenv").config();
const User = db.user;
const Op = db.Sequelize.Op;


const UserProfileFullResource = require("../resources/user/userprofilefullresource");

exports.RegisterUser = async (req, res) => {


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
        var user = {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            middlename: req.body.middlename,
            email: req.body.email,
            profile_image: '',
            password: req.body.password,

        };
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(req.body.password, salt);
        user.password = hashed;

        JWT.sign({ user }, process.env.SecretJwtKey, { expiresIn: '31536000' }, (err, token) => {
            if (err) {
                console.log("Error signing")
                res.send({ status: false, message: "Error Token " + err, data: null });
            }
            else {
                console.log("signed creating user")
                try {
                    User.create(user).then(async data => {
                        console.log("User created")
                        let u = await UserProfileFullResource(data);
                        res.send({ status: true, message: "User registered", data: { user: user, token: token } })
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
        })
    }

}


exports.LoginUser = async (req, res) => {
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
                JWT.sign({ user }, process.env.SecretJwtKey, { expiresIn: "365 d" }, async (error, token) => {
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

exports.GetUserProfile = (req, res) => {
    JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
        if (authData) {
            console.log("Auth data ", authData)
            let userid = authData.user.id;
            if (typeof req.query.userid !== 'undefined') {
                userid = req.query.userid;
            }
            const user = await User.findByPk(userid);
            if (user) {
                res.send({ status: true, message: "Profile ", data: await UserLiteResource(user, authData.user) })
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