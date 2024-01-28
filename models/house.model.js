const HouseModel = (sequelize, Sequelize) => {
    const House = sequelize.define("HouseModel", {
      
      ownership_status:{
        type:Sequelize.INTEGER,
        default: 1
      },
      onwership_status_other:{  // if user selects Other then it will be set
        type:Sequelize.STRING,
        default: ''
      },
      rent_paid: {
        type: Sequelize.DOUBLE,
        default: 0,
      },
      min_living_year: {
        type:Sequelize.INTEGER,
        default: 1
      },
      max_living_year: {
        type:Sequelize.INTEGER,
        default: 1
      },
      address:{
        type:Sequelize.STRING,
        default: ''
      },
      zipcode:{
        type:Sequelize.STRING,
        default: ''
      },
      from_year:{
        type:Sequelize.STRING,
      },
      to_year:{
        type:Sequelize.STRING,
      },
      landlord_name:{
        type:Sequelize.STRING,
        default: ''
      },
      contact_number:{
        type:Sequelize.STRING,
        default: ''
      },
    });
  
    return House;
  };

  export default HouseModel;