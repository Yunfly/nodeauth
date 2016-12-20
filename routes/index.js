var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/',ensureAuthenticated, function(req, res, next) {
  res.render('index', { title: 'Express' });
});

function ensureAuthenticated(req,res,next){
	// 点击首页时候，若检测用户退出登录后，跳转到登录界面
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect("/users/login")
}

module.exports = router;
