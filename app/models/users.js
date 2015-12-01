'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
	id: String,
	displayName: String,
	fullName: String,
	city: String,
	region: String
});

module.exports = mongoose.model('User', User);
