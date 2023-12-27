const UserModel = (sequelize, Sequelize) => {
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
      },
      plaid_access_token:{
        type:Sequelize.STRING,
        default: ''
      },
      plaid_user_token:{
        type:Sequelize.STRING,
        default: ''
      },
      role: {
        type: Sequelize.ENUM,
        values: ['user', 'admin', 'collector'],
        default: 'user'
      }
      
    }, 
    // {
    //   associate: function(models) {
    //     User.hasMany(models.PlaidTokens, { onDelete: 'cascade' });
    //   }
    // }
    );
  
    return User;
  };

  export default UserModel;