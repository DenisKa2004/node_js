const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "well_db",
});

module.exports = {
    query: (sql, params) => pool.execute(sql, params),
};
