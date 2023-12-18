module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("User", {
      firstname: {
        type: Sequelize.STRING
      },
      middlename: {
        type: Sequelize.STRING
      },
      lastname: {
        type: Sequelize.STRING
      },
      phone: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      bio: {
        type: Sequelize.STRING,
        default: ''
      },
      profile_image: {
        type: Sequelize.STRING,
        default: ''
      },
      fcm_token:{
        type:Sequelize.STRING,
        default: ''
      }
      ,
      
    });
  
    return User;
  };