var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs340_manickaa',
  password        : '8304',
  database        : 'cs340_manickaa'
});

module.exports.pool = pool;