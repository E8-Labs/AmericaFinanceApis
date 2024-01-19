const UserLoanDueDateModel = (sequelize, Sequelize) => {
    const PlaidTokens = sequelize.define("UserLoanDueDateModel", {
      
      due_date:{
        type:Sequelize.DATE,
        default: 0
      },
      amount_due: {
        type: Sequelize.DOUBLE,
        
      }
      
    });
  
    return PlaidTokens;
  };

  export default UserLoanDueDateModel;