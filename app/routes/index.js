'use strict';

var path = process.cwd();
var BookHandler = require(path + '/app/controllers/bookHandler.server.js');
var UserHandler = require(path + '/app/controllers/userHandler.server.js');

module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/login');
		}
	}

	var bookHandler = new BookHandler();
	var userHandler = new UserHandler();

	app.route('/')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/index.html');
		});

	app.route('/login')
		.get(function (req, res) {
			res.sendFile(path + '/public/login.html');
		});

	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/login');
		});

	app.route('/api/:id')
		.get(isLoggedIn, function (req, res) { res.json(req.user); });
		
	app.route('/api/:id/settings')		
		.post(isLoggedIn, userHandler.updateSettings);

	app.route('/auth/github')
		.get(passport.authenticate('github'));

	app.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			successRedirect: '/',
			failureRedirect: '/login'
		}));

	app.route('/api/all/books')
		.get(isLoggedIn, bookHandler.getAllBooks);

	app.route('/api/my/books')
		.get(isLoggedIn, bookHandler.getAllBooks);
		
	app.route('/api/books/:bookid')
		.post(isLoggedIn, bookHandler.addBook)
		.delete(isLoggedIn, bookHandler.removeBook);
};
