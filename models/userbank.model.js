// The bank details that user enters manually
const UserPaymentSourceModel = (sequelize, Sequelize) => {
    const UserBankAccount = sequelize.define("UserPaymentSourceModel", {
        bank_name:{
          type:Sequelize.STRING,
          default: ''
        },
        account_title:{
          type:Sequelize.STRING,
          default: ''
        },
        routing_number:{
          type:Sequelize.STRING,
          default: ''
        },
        account_number:{
          type:Sequelize.STRING,
          default: ''
        },
        account_type:{
          type:Sequelize.STRING,
          default: ''
        }
        
      });
    
      return UserBankAccount;
    };
  
    export default UserPaymentSourceModel;