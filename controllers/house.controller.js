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



const AddHouse = async(req, res)=>{
    JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
        if (authData) {
            const userid = authData.user.id;
            let house = {
                ownership_status: req.body.ownership_status,
                onwership_status_other: req.body.onwership_status_other,
                rent_paid: req.body.rent_paid,
                min_living_year: req.body.min_living_year,
                max_living_year: req.body.max_living_year,
                address: req.body.address,
                zipcode: req.body.zipcode,
                from_year: req.body.from_year,
                to_year: req.body.to_year,
                landlord_name: req.body.landlord_name,
                contact_number: req.body.contact_number,
                UserId: userid,
            }

            try {
                db.HouseModel.create(house).then(async data => {
                    console.log("House created ", data.id)
                    // let userToken = fetchOrCreateUserToken(data);
                    // console.log("User Token created in Register ", userToken)
                    // let u = await UserProfileFullResource(data);
                    res.send({ status: true, message: "House added", data: data })
                }).catch(error => {
                    console.log("House not created")
                    console.log(error)
                    res.send({
                        message:
                            err.message || "Some error occurred while adding the house.",
                        status: false,
                        data: null
                    });
                })
            }
            catch (error) {
                console.log("Exception ", error)
                console.log("House not created")
                console.log(error)
                res.send({
                    message:
                        err.message || "Some error occurred while adding the house.",
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


const GetHouseList = async(req, res)=>{
    JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
        if (authData) {
            let userid = authData.user.id;
            let houses = await db.HouseModel.findAll({where:{
                UserId: userid
            }})

            if (houses){
                res.send({ status: true, message: "Houses ", data: await HouseFullResource(houses) })
            }
            else{
                res.send({ status: true, message: "Houses list empty", data: null })
            }
        }
        else{
            res.send({ status: false, message: "Unauthenticated user", data: null })
        }
    })
}

export {AddHouse, GetHouseList}