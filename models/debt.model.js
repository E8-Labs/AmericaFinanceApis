const DebtModel = (sequelize, Sequelize) => {
    const Debt = sequelize.define("DebtModel", {
      
      debt_type:{
        type:Sequelize.STRING,
        default: ""
      },
      monthly_debt_obligation:{  // if user selects Other then it will be set
        type:Sequelize.STRING,
        default: ''
      },
      active_pay_day_loan: {
        type: Sequelize.BOOLEAN,
        default: false,
      },
      active_duty_force: {
        type:Sequelize.STRING,
        default: ""
      },
      bankruptcy_min_year: {
        type:Sequelize.INTEGER,
        default: 0
      },
      bankruptcy_max_year:{
        type:Sequelize.INTEGER,
        default: 0
      },
      outstanding_debt_type:{
        type:Sequelize.STRING, //CC, Loan, Other
        default: ''
      },
      lender_name:{
        type:Sequelize.STRING,
        default: ''
      },
      account_number:{
        type:Sequelize.STRING,
        default: ''
      },
      monthly_payment:{
        type:Sequelize.STRING,
        default: ''
      },
      due_date:{
        type:Sequelize.STRING,
        default: ''
      },
      total_balance_amount:{
        type: Sequelize.DOUBLE,
        default: 0
      }
    });
  
    return Debt;
  };

  export default DebtModel;