const StateTierLoanVariableModel = (sequelize, Sequelize) => {
    const Model = sequelize.define("StateTierLoanVariableModel", {
      
      
      waiver_fee:{  //to be deducted from the finace fee percentage
        type:Sequelize.DOUBLE,
        default: 0
      },
      tier:{  
        type:Sequelize.INTEGER,
        default: 0
      }
      
    });
  
    return Model;
  };

  export default StateTierLoanVariableModel;