
var Database = require('./database');
var User = require('./user');

var database = new Database();
var user = new User(database);

user.get('1')
    .then(function(result) {
        console.log(result);
    });