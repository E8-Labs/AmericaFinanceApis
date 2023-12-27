const PlaidTokensModel = (sequelize, Sequelize) => {
    const PlaidTokens = sequelize.define("PlaidTokens", {
      
      plaid_access_token:{
        type:Sequelize.STRING,
        default: ''
      },
      plaid_token_type:{ //IncomeVerification, Auth, IdentityVerification
        type:Sequelize.STRING,
        default: ''
      }
      ,
      
    });
  
    return PlaidTokens;
  };

  export default PlaidTokensModel;