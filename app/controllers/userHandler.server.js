'use strict';

var Users = require('../models/users.js');

function UserHandler () {
    
	this.updateSettings = function (req, res) {
		Users.findOneAndUpdate({ 'id': req.user.id }, { 'fullName': req.query.fullName, 'city': req.query.city, 'region': req.query.region })
			.exec(function (err, result) { if (err) { throw err; } res.json(result); });	    
	};
	
}

module.exports = UserHandler;
