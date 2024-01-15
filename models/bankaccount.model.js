const BankAccountModel = (sequelize, Sequelize) => {
    const PlaidTokens = sequelize.define("BankAccountModel", {
      account_id: {
        type: Sequelize.STRING,
        default: ''
      },
      balance_available:{
        type:Sequelize.DOUBLE,
        default: 0
      },
      balance_current:{ 
        type:Sequelize.DOUBLE,
        default: 0
      },
      name:{
        type:Sequelize.STRING,
        default: ''
      },
      official_name:{
        type:Sequelize.STRING,
        default: ''
      },
      mask:{
        type:Sequelize.STRING,
        default: ''
      },
      type:{
        type:Sequelize.STRING,
        default: ''
      },
      subtype:{
        type:Sequelize.STRING,
        default: ''
      }
      
    });
  
    return PlaidTokens;
  };

  export default BankAccountModel;