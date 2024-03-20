import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import nodeCron from "node-cron";
import chalk from "chalk";

import userRouter from "./routes/user.router.js";

import plaidRouter from "./routes/plaid.router.js";
import loanRouter from "./routes/loan.router.js";
import houseRouter from "./routes/hosue.router.js";

// import plaidRouter2 from "./rout"

import { verifyJwtToken } from "./middleware/jwtmiddleware.js";

import dotenv from 'dotenv'
dotenv.config();


const upload = multer();

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, "./uploads"), // cb -> callback
//   filename: (req, file, cb) => {
//     const uniqueName = `${Date.now()}-${Math.round(
//       Math.random() * 1e9
//     )}${path.extname(file.originalname)}`;
//     cb(null, uniqueName);
//   },
// });

const uploadImg = upload.single("image");//multer({storage: storage}).single('image');



const app = express();
app.use(cors());
app.use(express.json());



import db from "./models/index.js";

db.sequelize.authenticate().then(() => {
      //console.log("Connected to the database!");
    })
    .catch(err => {
      //console.log("Cannot connect to the database!", err);
      process.exit();
    });

// sync
db.sequelize.sync({alter: true})//{alter: true}



app.use("/api/users", uploadImg, userRouter);
// app.use("/api/prompts", promptRouter);
// app.use("/api/chats", chatRouter);

app.use("/api/plaid", verifyJwtToken, plaidRouter);//verifyJwtToken
app.use('/api/loans', verifyJwtToken, loanRouter);
app.use("/api/houses", verifyJwtToken, houseRouter);

//Runs every day every minute between 9-11 am
let number = 0
//fifth min, fifth sec of every hour
const job = nodeCron.schedule("5 5 * * * *", function fetchPendingBankTransactions() {
  // Download the latest info on the transactions and update database accordingly
  console.log(chalk.green("Running scheduled job ", number));
  number = number + 5;

});

job.start();

const server = app.listen(process.env.Port, ()=>{
    //console.log("Started listening on " + process.env.Port);
})
