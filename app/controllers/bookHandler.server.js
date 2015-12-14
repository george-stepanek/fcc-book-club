'use strict';

var Books = require('../models/books.js');

function BookHandler () {

	this.getMyBooks = function (req, res) {
		Books.find({ 'userid': req.user.id }).sort({ 'bookid': 'asc'})
			.exec(function (err, results) { if (err) { throw err; } res.json(results);	});
	};
	
	this.getAllBooks = function (req, res) {
		Books.find({  }).sort({ 'bookid': 'asc'})
			.exec(function (err, results) { if (err) { throw err; } res.json(results);	});
	};
	
	this.getRequestedBooks = function (req, res) {
		Books.find({ 'userid': req.user.id, requestedBy: { $ne: null } }).sort({ 'bookid': 'asc'})
			.exec(function (err, results) { if (err) { throw err; } res.json(results);	});
	};

	this.acceptRequest = function (req, res) {
		Books.findOne({ 'id': req.params.bookid }).exec(function (err, book) {
			if (err) { throw err; }
			Books.findOneAndUpdate({ 'id': req.params.bookid }, { $set: { userid: book.requestedBy, requestedBy: null }},
				function (err, result) { if (err) { throw err; } res.json(result); });			
		});
	
	};

	this.denyRequest = function (req, res) {	
		Books.findOneAndUpdate({ 'id': req.params.bookid }, { $set: { requestedBy: null }},
			function (err, result) { if (err) { throw err; } res.json(result); });	
	};

	this.addBook = function (req, res) {
		var newBook = { bookid: req.params.bookid, userid: req.user.id };
		Books.create([newBook], function (err, result) { if (err) { throw err; } res.json(result); });
	};

	this.removeBook = function (req, res) {
		Books.findOneAndRemove({ 'id': req.params.bookid }, function (err, result) { if (err) { throw err; } res.json(result); });
	};

	this.requestBook = function (req, res) {
		Books.findOneAndUpdate({ 'id': req.params.bookid }, { $set: { requestedBy: req.user.id }},
			function (err, result) { if (err) { throw err; } res.json(result); });
	};
}

module.exports = BookHandler;
