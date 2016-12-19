var express = require('express');
var router = express.Router();

var User = require('../models/user');

var multer = require('multer');
var upload = multer({
	dest: 'uploads/'
})

var passport = require('passport');
var localStrategy = require("passport-local").Strategy;

/* GET users listing. */
router.get('/', function(req, res, next) {
	res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
	res.render('register', {
		'title': 'Register'
	});
});

router.get('/login', function(req, res, next) {
	res.render('login', {
		'title': 'login'
	});
});

router.post('/register', upload.single('profileimage'), function(req, res, next) {
	// Get form Values
	var name = req.body.name;   
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;

	// Check for Image Field
	if (req.file) {
		console.log('Uploading File...');

		var profileImageOriginalName = req.files.profileimage.originalname;
		var profileImageName = req.files.profileimage.name;
		var profileImageMine = req.files.profileimage.minetype;
		var profileImagePath = req.files.profileimage.path;
		var profileImageExt = req.files.profileimage.extension;
		var profileImageSize = req.files.profileimage.size;
	} else {
		// set a Default Image
		console.log('noImg File...');
		var profileImageName = 'noimage.png'
	}

	// Form Validation
	req.checkBody('name', 'Name filed is required').notEmpty();
	req.checkBody('email', 'Email filed is required').notEmpty();
	req.checkBody('email', 'Email not valid').isEmail();
	req.checkBody('username', 'Username filed is required').notEmpty();
	req.checkBody('password', 'Password filed is required').notEmpty();
	req.checkBody('password2', 'Password2 do not match').equals(req.body.password);

	// Check for errors
	var errors = req.validationErrors();

	if (errors) {
		res.render('register', {
			errors: errors,
			name: name,
			email: email,
			username: username,
			password: password,
			password2: password2
		});
	} else {
		var newUser = new User({
			errors: errors,
			name: name,
			email: email,
			username: username,
			password: password,
			profileimage: profileImageName
		});
		User.createUser(newUser, function(err, user) {

			if (err) throw err;
			console.log(user);
		});

		req.flash('success', 'your are redy');
		res.location('/');
		res.redirect('/');
	}
});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new localStrategy(
	function(username,password,done){
		User.getUserByUsername(username,function(err,user){
			if (err) {throw err}
			if (!user) {
				console.log('Unknow User');
				return done(null,false,{message:'Unknow User'})
			}
			User.comparePassword(password,user.password,function(err,isMatch){
				if(err) throw err;
				if(isMatch){
					return done(null,user);
				} else {
					console.log('Incalid Password');
					return done(null,false,{message:'Incalid password'})
				}
			});
		});
	}
));

router.post('/login',passport.authenticate('local',{failureRedirect:'/users/login',failureFlash:'Invalid username or password'}),function(req,res){
	console.log('Authentication Successful');
	req.flash('success','You are logged in');
	res.redirect('/');
});


router.get('/logout',function(req,res){
	req.logout;
	req.flash('success','You have logged out');
	res.redirect('/users/login');
});
module.exports = router;