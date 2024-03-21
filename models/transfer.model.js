const TransferModel = (sequelize, Sequelize) => {
  const Transfer = sequelize.define("Transfers", {

    AuthorizationId: {
      type: Sequelize.STRING,
      default: ''
    },
    ValidationCode: {
      type: Sequelize.INTEGER,
      default: null
    },
    TransferStatus: {
      type: Sequelize.STRING,
      default: null
    },
    DebitCreditResponseSuccess: {
      type: Sequelize.BOOLEAN,
      default: null
    },
    Status: {
      type: Sequelize.INTEGER,
      default: null
    },
    ReturnCode: {
      type: Sequelize.INTEGER,
      default: null
    },
    Amount: {
      type: Sequelize.DOUBLE,
      default: null
    },
    FirstName: {
      type: Sequelize.STRING,
      default: ''
    },
    LastName: {
      type: Sequelize.STRING,
      default: ''
    },
    TranCode: {
      type: Sequelize.STRING,
      default: '' //D for Debit | C for Credit
    },
  });

  return Transfer;
};

export default TransferModel;