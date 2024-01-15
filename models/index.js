import dbConfig from "../config/db.config.js";

import  Sequelize from "sequelize";
console.log("Connecting DB")
console.log(dbConfig.MYSQL_DB_PASSWORD)
const sequelize = new Sequelize(dbConfig.MYSQL_DB, dbConfig.MYSQL_DB_USER, dbConfig.MYSQL_DB_PASSWORD, {
  host: dbConfig.MYSQL_DB_HOST,
  port: dbConfig.MYSQL_DB_PORT,
  dialect: dbConfig.dialect,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

import UserModel from "./user.model.js";
import PlaidTokensModel from "./plaidtokens.model.js";
import TransferModel from "./transfer.model.js";
// import LoanStatusModel from "./loanstatus.model.js";
import LoanModel from "./loan.model.js";

import HouseModel from "./house.model.js";
import DebtModel from "./debt.model.js";
import BankAccountModel from "./bankaccount.model.js";
import MortgageLoanModel from "./mortgageloan.model.js";
import StudentLoanModel from "./studentloan.model.js";


db.user = UserModel(sequelize, Sequelize);

db.PlaidTokens = PlaidTokensModel(sequelize, Sequelize)
db.PlaidTokens.belongsTo(db.user);
db.user.hasMany(db.PlaidTokens, { onDelete: 'CASCADE', hooks: true });

// db.LoanStatusModel = LoanStatusModel(sequelize, Sequelize);

db.LoanModel = LoanModel(sequelize, Sequelize);
db.LoanModel.belongsTo(db.user);
db.user.hasMany(db.LoanModel, {onDelete: 'CASCADE', hooks: true});
// db.LoanModel.hasOne(db.LoanStatusModel);
// db.LoanStatusModel.belongsTo(db.LoanModel);



db.Transfer = TransferModel(sequelize, Sequelize);
db.Transfer.belongsTo(db.user);
db.user.hasMany(db.Transfer, { onDelete: 'CASCADE', hooks: true });
db.Transfer.belongsTo(db.LoanModel);
db.LoanModel.hasOne(db.Transfer);


db.HouseModel = HouseModel(sequelize, Sequelize);
db.HouseModel.belongsTo(db.user);
db.user.hasMany(db.HouseModel, {onDelete: "CASCADE", hooks: true})


db.DebtModel = DebtModel(sequelize, Sequelize);
db.DebtModel.belongsTo(db.user)
db.user.hasMany(db.DebtModel, {onDelete: 'CASCADE', hooks: true})

db.BankAccountModel = BankAccountModel(sequelize, Sequelize);
db.BankAccountModel.belongsTo(db.user)
db.user.hasMany(db.BankAccountModel, {onDelete: 'CASCADE', hooks: true})

db.MortgageLoanModel = MortgageLoanModel(sequelize, Sequelize);
db.MortgageLoanModel.belongsTo(db.user)
db.user.hasMany(db.MortgageLoanModel, {onDelete: 'CASCADE', hooks: true})

db.StudentLoanModel = StudentLoanModel(sequelize, Sequelize);
db.MortgageLoanModel.belongsTo(db.user)
db.user.hasMany(db.StudentLoanModel, {onDelete: 'CASCADE', hooks: true})

// db.category = require("./category/category.model.js")(sequelize, Sequelize);
// db.subcategory = require("./category/subcategory.model.js")(sequelize, Sequelize, db.category);
// db.prompt = require("./prompt.model.js")(sequelize, Sequelize, db.user)
// db.promptcategory = require("./category/promptcategory.model.js")(sequelize, Sequelize, db.category, db.prompt);
// db.prompt.hasMany(db.promptcategory, {
//   onDelete: 'CASCADE',
//   onUpdate: 'CASCADE'
// })
// db.promptsubcategory = require("./category/promptsubcategory.model.js")(sequelize, Sequelize, db.subcategory, db.prompt);
// db.prompt.hasMany(db.promptsubcategory, {
//   onDelete: 'CASCADE',
//   onUpdate: 'CASCADE'
// })

// db.promptquestion = require("./promptquestion.model.js")(sequelize, Sequelize, db.prompt)
// db.prompt.hasMany(db.promptquestion, {
//   onDelete: 'CASCADE',
//   onUpdate: 'CASCADE'
// })




// db.chat = require("./chat/chat.model.js")(sequelize, Sequelize, db.user, db.prompt);
// db.message = require("./chat/message.model.js")(sequelize, Sequelize, db.chat);

// db.promptlikeview = require("./promptlike.model.js")(sequelize, Sequelize, db.prompt, db.user, db.message)



// db.promptcomment = require("./promptcomment.model.js")(sequelize, Sequelize, db.prompt, db.user)

// db.following = require("./following.js")(sequelize, Sequelize, db.user)
export default db;