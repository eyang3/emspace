var pgfmt = require('pg-format');
var _ = require('lodash');

function User(database) {
    this.database = database;
}

function generateSpecializations(specializations) {
    var spec = {};
    _.each(specializations.split(','), function (fields) {
        fields = fields.trim();
        spec[fields] = 1;
    });
    return spec;
}
User.prototype.hasNewSpecializations = function (user, oldSpec) {
    if (oldSpec === null) {
        return true;
    }
    var newSpec = generateSpecializations(user.specialties);
    var retVal = false;
    _.each(newSpec, function (value, key) {
        if (oldSpec[key] === undefined) {
            retVal = true;
        }
    });
    if (!retVal) {
        _.each(oldSpec, function (value, key) {
            if (newSpec[key] === undefined) {
                retVal = true;
            }
        });
    }
    return retVal;
}

User.prototype.insert = function (user) {
    var specializations = generateSpecializations(user.specialties);
    var query = pgfmt('insert into public.user (id, firstname, lastname, specializations) values (%L, %L, %L, %L)',
        user.id, user.firstName, user.lastName, JSON.stringify(specializations));
    return this.database.query(query);
}

User.prototype.updateSpecialization = function (user) {
    var newSpec = generateSpecializations(user.specialties);
    var query = pgfmt('update public.user set specializations = %L where id = %L', JSON.stringify(newSpec), user.id);
    return this.database.query(query);

}

User.prototype.delete = function (userid) {

}

User.prototype.get = function (userid) {
    var query = pgfmt('select * from public.user where id = %L', userid);
    return this.database.query(query);
}


module.exports = User;