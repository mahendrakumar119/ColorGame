var Campground=require("../models/campground");
var Comment=require("../models/comment");
var User   =require("../models/user");
//ALL MIDDLEWARE GOES HERE
var middlewareObj={}
//MIDDLEWARE to check CampgroundOnwernship
middlewareObj.checkCampgroundOnwership=function(req,res,next){
	if(req.isAuthenticated()){
		Campground.findById(req.params.id,function(err,foundCampground){
			if(err){
				res.redirect("back");//it will redirect to the page from where it is came
			}
			else{
				if(foundCampground.author.id.equals(req.user._id) || req.user.isSiteAdmin){
					return next();
				}
				else{
					res.redirect("back");
				}
			}
		});
	}
}


//MIDDLEWARE to check CommentOnwernship
middlewareObj.checkCommentOnwership=function(req,res,next){
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id,function(err,foundComment){
			if(err){
				res.redirect("back");//it will redirect to the page from where it is came
			}
			else{
				//does user own comment?
				if(foundComment.author.id.equals(req.user._id) || req.user.isSiteAdmin){
					return next();
				}
				else{
					res.redirect("back");
				}
			}
		});
	}
}

//middleware implementation
middlewareObj.isLoggedIn=function(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	else{
		req.flash("error","You need to login first");
		return res.redirect("/login");
	}
}
//middleware to check admin ownership
middlewareObj.isSiteAdmin=function(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	else{
		req.flash("error","You need to login first");
		return res.redirect("/login");
	}
}

module.exports=middlewareObj