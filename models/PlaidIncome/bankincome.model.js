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


  

  export {BankIncomeModel, PayrollIncomeModel};