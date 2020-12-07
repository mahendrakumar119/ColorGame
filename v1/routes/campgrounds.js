var express=require('express');
var router=express.Router();
var Campground=require('../models/campground');
var User=require('../models/user');
var middleware=require("../middleware");
// INDEX ROUTE
router.get("/",function(req,res){
	console.log(req.user);
	//get all campgrounds from mongodb
	Campground.find({},function(err,allCampgrounds){
		if(err){
			consle.log(err);
		}
		else{
			res.render("campgrounds/index",{camps:allCampgrounds});
		}
	});
});

// CAMPGROUND NEW 
router.get("/new",middleware.isLoggedIn,function(req,res){
	res.render("campgrounds/new");
});
//SHOW CAMPGROUND
router.get("/:id",function(req,res){
	Campground.find({},function(err,campgrounds){
		Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
		if(err){
			console.log(err);
		}
		else{
			//render to show page
			//console.log(foundCampground);
			res.render("campgrounds/show",{camp:foundCampground,camps:campgrounds});
		}
	});
		
	});
	// find id from mongodb
	//since we are reference throungh comment id in campground model so to get the whole comment object into the campground model we used populate and exec functions!!
	
	

});
// CREATE CAMPGROUND 
router.post("/",middleware.isLoggedIn,function(req,res){
	//get form data
	var name=req.body.name;
	var price=req.body.price;
	var image=req.body.image;
	var description=req.body.description;
	var author={
		id:req.user._id,
		username:req.user.username
	};
	var newCamp={name:name,price:price,image:image,description:description,author:author};
	//console.log(req.user);
	Campground.create(newCamp,function(err,newCampground){
		if(err){
			console.log(err);
		}
		else{
			//console.log("camp is"+newCampground);
			//redirect back to campground page
			req.flash("success","Campground added successfully!!");
			res.redirect("/campground");
		}
	});
	
	
});
//EDIT CAMPGROUND ROUTE
router.get("/:id/edit",middleware.checkCampgroundOnwership,function(req,res){
	Campground.findById(req.params.id,function(err,foundCampground){
		res.render("campgrounds/edit",{camp: foundCampground});
	});
});
//UPDATE CAMPGROUND ROUTE
router.put("/:id",middleware.checkCampgroundOnwership,function(req,res){
	//FINDBY ID AND UPDATE
	//findByIdAndUpdate(id,updated_data,callbak)
	Campground.findByIdAndUpdate(req.params.id,req.body.campground,function(err,updatedCampground){
		if(err){
			res.redirect("/campground");
		}
		else{
			req.flash("success","Campground updated successfully!");
			res.redirect("/campground/" +req.params.id);
		}
		
	});
	
});
//DESTROY CAMPGROUND ROUTE
router.delete("/:id",middleware.checkCampgroundOnwership,function(req,res){
	Campground.findByIdAndRemove(req.params.id,function(err,deletedCampground){
		if(err){
			console.log(err);
		}
		else{
			//console.log(deletedCampground);
			req.flash("success","Campground deleted successfully!");
			res.redirect("/campground");
		}
	});
});



module.exports=router;