// The bank details that user enters manually
const UserPaymentSourceModel = (sequelize, Sequelize) => {
    const UserBankAccount = sequelize.define("UserPaymentSourceModel", {
        bank_name:{
          type:Sequelize.STRING,
          default: ''
        },
        is_default:{
          type:Sequelize.BOOLEAN,
          default: false
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