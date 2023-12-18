require("dotenv").config()


module.exports = {
    MYSQL_DB_HOST: process.env.MYSQL_DB_HOST,
    MYSQL_DB_USER: process.env.MYSQL_DB_USER,
    MYSQL_DB_PASSWORD: process.env.MYSQL_DB_PASSWORD,
    MYSQL_DB: process.env.MYSQL_DB,
    MYSQL_DB_PORT: process.env.MYSQL_DB_PORT,        
    dialect: "mysql"
}