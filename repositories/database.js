var pg = require('pg');
var bluebird = require('bluebird');
var connectionString = process.env.emspaceConn;


function Database() {
    this.connection = null;
}

Database.prototype.init = function () {
    return new bluebird(function (resolve, reject) {
        pg.connect(connectionString, function (err, client, done) {
            if (err) {
                reject(err);
            } else {
                resolve({ client: client, done: done });
            }
        })
    });
};

Database.prototype.query = function (query) {
    var initConn;
    if (this.connection === null) {
        initConn = this.init()
            .then(function (connObj) {
                this.connection = connObj;
            })
    } else {
        initConn = new bluebird.resolve(0);

    }
    return initConn
        .then(function () {
            return new bluebird(function (resolve, reject) {
                var self = this;
                this.connection.client.query(query, function (err, result) {
                    if (err) {
                        reject(err);
                    }
                    self.connection.done();
                    if (result === undefined) {
                        resolve(0);
                    } else {
                        resolve(result.rows);
                    }
                });
            });
        });

};

module.exports = Database;