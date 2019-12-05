var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs340_roberamy',
  password        : '4380',
  database        : 'cs340_roberamy'
});

module.exports.pool = pool;
