const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const userRouter = require("./routes/user.router");

require("dotenv").config();


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



const db = require("./models");

db.sequelize.authenticate().then(() => {
      console.log("Connected to the database!");
    })
    .catch(err => {
      console.log("Cannot connect to the database!", err);
      process.exit();
    });

// sync
db.sequelize.sync({alter: true})//{alter: true}



app.use("/api/users", uploadImg, userRouter);
// app.use("/api/prompts", promptRouter);
// app.use("/api/chats", chatRouter);



const server = app.listen(process.env.Port, ()=>{
    console.log("Started listening on " + process.env.Port);
})
