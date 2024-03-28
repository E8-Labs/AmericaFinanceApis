const BankIncomeModel = (sequelize, Sequelize) => {
    const BankIncomeModel = sequelize.define("BankIncomeModel", {
      
    data:{
        type:Sequelize.STRING(10000),
        default: ""
      },
     
      
    });
  
    return BankIncomeModel;
  };

  const PayrollIncomeModel = (sequelize, Sequelize) => {
    const PayrollIncomeModel = sequelize.define("PayrollIncomeModel", {
      
    data:{
        type:Sequelize.STRING(10000),
        default: ""
      },
     
      
    });
  
    return PayrollIncomeModel;
  };



  const EmploymentDetailModel = (sequelize, Sequelize) => {
    const EmploymentDetailModel = sequelize.define("EmploymentDetailModel", {
      
    data:{
        type:Sequelize.STRING(10000),
        default: ""
      },
     
      
    });
  
    return EmploymentDetailModel;
  };

  

  export {BankIncomeModel, PayrollIncomeModel, EmploymentDetailModel};