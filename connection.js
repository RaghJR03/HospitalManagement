var mysql=require('mysql');


const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'med-x',
    waitForConnections: true,
    connectionLimit: 10, // Adjust according to your needs
    queueLimit: 0
  });
  
module.exports=pool;