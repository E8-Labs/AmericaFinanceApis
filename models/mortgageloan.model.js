const MortgageLoanModel = (sequelize, Sequelize) => {
    const PlaidTokens = sequelize.define("MortgageLoanModel", {
      account_id: {
        type: Sequelize.STRING,
        default: ''
      },
      account_number: {
        type: Sequelize.STRING,
        default: ''
      },
      current_late_fee:{
        type:Sequelize.DOUBLE,
        default: 0
      },
      escrow_balance:{ 
        type:Sequelize.DOUBLE,
        default: 0
      },
      last_payment_amount:{ 
        type:Sequelize.DOUBLE,
        default: 0
      },
      last_payment_date: {
        type: Sequelize.STRING,
        default: ''
      },
      loan_type_description: {
        type: Sequelize.STRING,
        default: ''
      },
      loan_term: {
        type: Sequelize.STRING,
        default: ''
      },
      maturity_date: {
        type: Sequelize.STRING,
        default: ''
      },
      next_monthly_payment: {
        type: Sequelize.STRING,
        default: ''
      },
      next_payment_due_date: {
        type: Sequelize.STRING,
        default: ''
      },
      origination_date: {
        type: Sequelize.STRING,
        default: ''
      },
      origination_principal_amount:{
        type:Sequelize.DOUBLE,
        default: 0
      },
      past_due_amount:{
        type:Sequelize.DOUBLE,
        default: 0
      },

//address of the property mortgaged
      city: {
        type: Sequelize.STRING,
        default: ''
      },
      country: {
        type: Sequelize.STRING,
        default: ''
      },
      postal_code: {
        type: Sequelize.STRING,
        default: ''
      },
      street: {
        type: Sequelize.STRING,
        default: ''
      },
      region: {
        type: Sequelize.STRING,
        default: ''
      },
      ytd_interest_paid:{
        type:Sequelize.DOUBLE,
        default: 0
      },
      ytd_principal_paid:{
        type:Sequelize.DOUBLE,
        default: 0
      },


      has_pmi:{
        type:Sequelize.BOOLEAN,
        default: true
      },
      has_prepayment_penalty:{
        type:Sequelize.BOOLEAN,
        default: true
      },
      interest_rate:{
        type:Sequelize.DOUBLE,
        default: 0
      },
      interest_type:{
        type:Sequelize.STRING,
        default: 'fixed'
      },
      
      
    });
  
    return PlaidTokens;
  };

  export default MortgageLoanModel;