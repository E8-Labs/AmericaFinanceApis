const StudentLoanModel = (sequelize, Sequelize) => {
    const PlaidTokens = sequelize.define("StudentLoanModel", {
      account_id: {
        type: Sequelize.STRING,
        default: ''
      },
      account_number: {
        type: Sequelize.STRING,
        default: ''
      },
      expected_payoff_date:{
        type:Sequelize.STRING,
        default: 0
      },
      guarantor:{ 
        type:Sequelize.STRING,
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
      last_statement_balance: {
        type: Sequelize.DOUBLE,
        default: ''
      },
      last_statement_issue_date: {
        type: Sequelize.STRING,
        default: ''
      },
      loan_name: {
        type: Sequelize.STRING,
        default: ''
      },
      loan_status: {
        type: Sequelize.STRING,
        default: ''
      },
      minimum_payment_amount: {
        type: Sequelize.DOUBLE,
        default: ''
      },
      next_payment_due_date: {
        type: Sequelize.STRING,
        default: ''
      },
      origination_date:{
        type:Sequelize.STRING,
        default: 0
      },
      origination_principal_amount:{
        type:Sequelize.DOUBLE,
        default: 0
      },
      outstanding_interest_amount:{
        type:Sequelize.DOUBLE,
        default: 0
      },
      payment_reference_number:{
        type:Sequelize.STRING,
        default: ''
      },
      pslf_estimated_eligibility_date:{
        type:Sequelize.STRING,
        default: ''
      },
      pslf_payments_made:{
        type:Sequelize.DOUBLE,
        default: 0
      },
      pslf_payments_remaining:{
        type:Sequelize.DOUBLE,
        default: 0
      },
      repayment_plan:{ // standard etc
        type:Sequelize.STRING,
        default: ''
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


      interest_rate_percentage:{
        type:Sequelize.DOUBLE,
        default: 0
      }
      
      
    });
  
    return PlaidTokens;
  };

  export default StudentLoanModel;