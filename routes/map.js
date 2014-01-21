
exports.viewMap = function(req, res) {
	if(!req.user){
		return res.redirect('/user/login');
	}

	res.render('map');
}