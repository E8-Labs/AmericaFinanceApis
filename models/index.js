import dbConfig from "../config/db.config.js";

import  Sequelize from "sequelize";
//console.log("Connecting DB")
//console.log(dbConfig.MYSQL_DB_PASSWORD)
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
import SupportedStateModel from "./supportedstates.model.js";
import StateTierLoanVariableModel from "./statetierloanvariables.model.js";
import UserLoanDueDateModel from "./userloanduedates.model.js";
import UserVerificationModel from "./userverification.model.js";
import UserPaymentSourceModel from "./userbank.model.js";
import passwordresetcodeModel from "./passwordresetcode.model.js";
import {BankIncomeModel, PayrollIncomeModel, EmploymentDetailModel} from "./PlaidIncome/bankincome.model.js";


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

db.userVerificationModel = UserVerificationModel(sequelize, Sequelize);
db.userVerificationModel.belongsTo(db.user);
db.user.hasMany(db.userVerificationModel, {onDelete: 'CASCADE', hooks: true});

db.BankAccountModel = BankAccountModel(sequelize, Sequelize);
db.BankAccountModel.belongsTo(db.user)
db.user.hasMany(db.BankAccountModel, {onDelete: 'CASCADE', hooks: true})

db.MortgageLoanModel = MortgageLoanModel(sequelize, Sequelize);
db.MortgageLoanModel.belongsTo(db.user)
db.user.hasMany(db.MortgageLoanModel, {onDelete: 'CASCADE', hooks: true})

db.StudentLoanModel = StudentLoanModel(sequelize, Sequelize);
db.MortgageLoanModel.belongsTo(db.user)
db.user.hasMany(db.StudentLoanModel, {onDelete: 'CASCADE', hooks: true})

db.SupportedStateModel = SupportedStateModel(sequelize, Sequelize);

db.StateTierLoanVariableModel = StateTierLoanVariableModel(sequelize, Sequelize);
db.StateTierLoanVariableModel.belongsTo(db.SupportedStateModel)
db.SupportedStateModel.hasOne(db.StateTierLoanVariableModel, {onDelete: 'CASCADE', hooks: true})


db.UserLoanDueDateModel = UserLoanDueDateModel(sequelize, Sequelize);
db.UserLoanDueDateModel.belongsTo(db.LoanModel);
db.LoanModel.hasMany(db.UserLoanDueDateModel, {onDelete: 'CASCADE', hooks: true})
db.passwordResetCode = passwordresetcodeModel(sequelize, Sequelize);

// this is the model where we save user's bank details added manually
db.UserPaymentSourceModel = UserPaymentSourceModel(sequelize, Sequelize); 
db.UserPaymentSourceModel.belongsTo(db.user);
db.user.hasMany(db.UserPaymentSourceModel);

db.plaidBankIncomeModel = BankIncomeModel(sequelize, Sequelize);
db.plaidBankIncomeModel.belongsTo(db.user);
db.user.hasMany(db.plaidBankIncomeModel);

db.payrollIncomeModel = PayrollIncomeModel(sequelize, Sequelize);
db.payrollIncomeModel.belongsTo(db.user);
db.user.hasMany(db.payrollIncomeModel);


db.employmentDetailModel = EmploymentDetailModel(sequelize, Sequelize);
db.employmentDetailModel.belongsTo(db.user);
db.user.hasMany(db.employmentDetailModel);


export default db;