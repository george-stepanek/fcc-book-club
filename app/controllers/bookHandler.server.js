'use strict';

var Books = require('../models/books.js');

function BookHandler () {

	this.getMyBooks = function (req, res) {
		Books.find({ 'userid': req.user.id }).exec(function (err, results) { if (err) { throw err; } res.json(results);	});
	};
	
	this.getAllBooks = function (req, res) {
		Books.find({  }).exec(function (err, results) { if (err) { throw err; } res.json(results);	});
	};

	this.addBook = function (req, res) {
		var newBook = { bookid: req.params.bookid, userid: req.user.id };
		Books.create([newBook], function (err, result) { if (err) { throw err; } res.json(result); });
	};

	this.removeBook = function (req, res) {
		Books.findOneAndRemove({ 'id': req.params.bookid }, function (err, result) { if (err) { throw err; } res.json(result); });
	};

}

module.exports = BookHandler;
