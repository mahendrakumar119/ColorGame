var express=require('express');
var router=express.Router();
var Campground=require('../models/campground');
var Comment  =require('../models/comment');
var middleware=require("../middleware");

//COMMENT NEW
router.get("/campground/:id/comments/new",middleware.isLoggedIn,function(req,res){
	//find campground by id 
	Campground.findById(req.params.id,function(err,foundCampground){
		if(err){
			console.log(err);
		}
		else{
			//render to new form
			//console.log(foundCampground);
			res.render("comments/new",{camp:foundCampground});
		}
	});
});
//COMMENT CREATE
router.post("/campground/:id/comments",middleware.isLoggedIn,function(req,res){
	//lookup for the campground
	Campground.findById(req.params.id,function(err,foundCampground){
		if(err){
			console.log(err);
			res.redirect("/campground");
		}
		else{
			//create new commet
			Comment.create(req.body.comment,function(err,comment){
				if(err){
					console.log(err);
				}
				else{
					comment.comment_date=Date.now();
					//add userid tand username to comment models
					comment.author.id=req.user._id;
					comment.author.username=req.user.username;
					comment.save();
					//connect new comment to campground
					foundCampground.comments.push(comment);
					foundCampground.save();
					//redirect campground show page
					console.log("comment is "+comment);
					req.flash("success","Comment posted successfully!");
					res.redirect("/campground/" +foundCampground._id);
				}
			});
		}
	});
	
	
	
});
//EDIT COMMENT ROUTE
router.get("/campground/:id/comments/:comment_id/edit",middleware.checkCommentOnwership, function(req,res){
	Comment.findById(req.params.comment_id,function(err,foundComment){
		if(err){
			res.redirectt("back");
		}else{
			
			res.render("comments/edit",{campground_id:req.params.id,comment:foundComment});
		}
	});
	
	
});
//UPDATE COMMENT ROUTE
router.put("/campground/:id/comments/:comment_id",middleware.checkCommentOnwership, function(req,res){
	//find by id and update
	Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,updatedComment){
		if(err){
			res.redirect("back");
		}else{
			req.flash("success","Comment updated successfully!!");
			res.redirect("/campground/"+req.params.id);
		}
	});
	
});
//DELETE COMMENT ROUTE
router.delete("/campground/:id/comments/:comment_id",middleware.checkCommentOnwership,function(req,res){
	//find by id and remove
	Comment.findByIdAndRemove(req.params.comment_id,function(err,deletedComment){
		if(err){
			res.redirect("back");
		}else{
			req.flash("success","Comment deleted successfully!");
			res.redirect("/campground/"+req.params.id);
		}
	});
	
});



module.exports=router;