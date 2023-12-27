const LoanModel = (sequelize, Sequelize) => {
    const PlaidTokens = sequelize.define("LoanModel", {
      
      amount_requested:{
        type:Sequelize.DOUBLE,
        default: 0
      },
      amount_approved:{ 
        type:Sequelize.DOUBLE,
        default: 0
      },
      loan_status:{
        type:Sequelize.ENUM,
        values: ['pending', 'rejected', 'notserviced', 'approved', 'cancelled', 'completed'],
        default: 'pending'
      }
      
    });
  
    return PlaidTokens;
  };

  export default LoanModel;