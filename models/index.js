const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
console.log("Connecting DB")
console.log(dbConfig.MYSQL_DB_PASSWORD)
const sequelize = new Sequelize(dbConfig.MYSQL_DB, dbConfig.MYSQL_DB_USER, dbConfig.MYSQL_DB_PASSWORD, {
  host: dbConfig.MYSQL_DB_HOST,
  port: dbConfig.MYSQL_DB_PORT,
  dialect: dbConfig.dialect,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("./user.model.js")(sequelize, Sequelize);
// db.category = require("./category/category.model.js")(sequelize, Sequelize);
// db.subcategory = require("./category/subcategory.model.js")(sequelize, Sequelize, db.category);
// db.prompt = require("./prompt.model.js")(sequelize, Sequelize, db.user)
// db.promptcategory = require("./category/promptcategory.model.js")(sequelize, Sequelize, db.category, db.prompt);
// db.prompt.hasMany(db.promptcategory, {
//   onDelete: 'CASCADE',
//   onUpdate: 'CASCADE'
// })
// db.promptsubcategory = require("./category/promptsubcategory.model.js")(sequelize, Sequelize, db.subcategory, db.prompt);
// db.prompt.hasMany(db.promptsubcategory, {
//   onDelete: 'CASCADE',
//   onUpdate: 'CASCADE'
// })

// db.promptquestion = require("./promptquestion.model.js")(sequelize, Sequelize, db.prompt)
// db.prompt.hasMany(db.promptquestion, {
//   onDelete: 'CASCADE',
//   onUpdate: 'CASCADE'
// })




// db.chat = require("./chat/chat.model.js")(sequelize, Sequelize, db.user, db.prompt);
// db.message = require("./chat/message.model.js")(sequelize, Sequelize, db.chat);

// db.promptlikeview = require("./promptlike.model.js")(sequelize, Sequelize, db.prompt, db.user, db.message)



// db.promptcomment = require("./promptcomment.model.js")(sequelize, Sequelize, db.prompt, db.user)

// db.following = require("./following.js")(sequelize, Sequelize, db.user)
module.exports = db;