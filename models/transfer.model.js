const TransferModel = (sequelize, Sequelize) => {
    const Transfer = sequelize.define("Transfers", {
    
        transfer_id:{
            type: Sequelize.STRING,
            default: ''
        },
      request_id:{
        type:Sequelize.STRING,
        default: ''
      },
      account_id:{ //
        type:Sequelize.STRING,
        default: ''
      },
      amount:{ //
        type:Sequelize.STRING,
        default: ''
      },
      created:{ //
        type:Sequelize.STRING,
        default: ''
      },
      description:{ //
        type:Sequelize.STRING,
        default: ''
      },
      failure_reason:{ //
        type:Sequelize.STRING,
        default: ''
      },
      funding_account_id:{ //
        type:Sequelize.STRING,
        default: ''
      },
      status:{ //
        type:Sequelize.STRING,
        default: ''
      },
      sweep_status:{ 
        type:Sequelize.STRING,
        default: ''
      },
      type:{ //Debit, Credit
        type:Sequelize.STRING,
        default: ''
      },
      legal_name:{ 
        type:Sequelize.STRING,
        default: ''
      },
      phone_number:{ 
        type:Sequelize.STRING,
        default: ''
      },
      email_address:{ 
        type:Sequelize.STRING,
        default: ''
      },
      
      
    });
  
    return Transfer;
  };

  export default TransferModel;