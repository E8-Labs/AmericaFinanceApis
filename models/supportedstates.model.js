const SupportedStateModel = (sequelize, Sequelize) => {
    const Model = sequelize.define("SupportedStateModel", {
      
      state_name:{
        type:Sequelize.STRING,
        default: ""
      },
      finance_fee:{ 
        type:Sequelize.DOUBLE,
        default: 0
      },
      min_loan:{ 
        type:Sequelize.DOUBLE,
        default: 0
      },
      max_loan:{
        type:Sequelize.DOUBLE,
        default: 0
      }
      
    });
  
    return Model;
  };

  export default SupportedStateModel;