'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Book = new Schema({
	userid: String,
	bookid: String,
	id: { type:Schema.ObjectId, default: mongoose.Types.ObjectId }
});

module.exports = mongoose.model('Book', Book);
