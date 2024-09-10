const mysql = require('mysql');
const dbInfo = {
    host: 'localhost',
    user: 'root',
    password: '0530!',
    database: 'newquizdb'
};

module.exports = {
    init: function() {
        return mysql.createConnection(dbInfo);
    },
    connect: function(conn) {
        conn.connect(function(err) {
            if(err) console.error('mysql 연결 에러 : ' + err);
            else console.log('mysql 연결 성공');
        });
    }
}