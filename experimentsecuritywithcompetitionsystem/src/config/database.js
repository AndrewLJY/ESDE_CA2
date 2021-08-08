const mysql = require('mysql');
const config = require('./config');
//To find out more on createPool:
//https://www.npmjs.com/package/mysql#pooling-connections

const pool = mysql.createPool({
        connectionLimit: 100,
        host: 'esde-ca2-rds-database-2.cyfxw2uf8a1c.us-east-1.rds.amazonaws.com',
        user: "leastPrivUser",
        password: "kyureoscorpio7!",
        database: "competition_system_security_concept_v2_db",
        multipleStatements: true
    });

 module.exports=pool;
