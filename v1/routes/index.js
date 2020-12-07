var express =require('express');
var router  =express.Router();
var passport=require('passport');
var User    =require('../models/user');
var crypto  =require('crypto');
var nodemailer=require('nodemailer');
var async     =require('async');
var middleware=require("../middleware");
require('dotenv/config');
//View All ussrs to admin
router.get("/viewusers",middleware.isSiteAdmin,function(req,res){
	User.find({},function(err,allUsers){
		if(req.user.isSiteAdmin){
			res.render("viewUsers",{users:allUsers});
		}else{
			res.redirect("/campground");
		}
	});
});
//Delete user router
router.delete("/user/:id",middleware.isSiteAdmin,function(req,res){
	User.findByIdAndRemove(req.params.id,function(err,deletedUser){
		if(err){
			res.redirect("back");
		}else{
			console.log("User deleted successfully");
			res.redirect("/viewusers");
		}
	});
});
// home page
router.get("/",function(req,res){
	res.render("landing");
});

//=============================================

// AUTHENTICATION ROUTES
//REGISTER SHOW FORM
router.get("/register",function(req,res){
	res.render("register");
});
//SIGNUP HANDLE ROUTES
router.post("/register",function(req,res){
	var newUser=new User({username:req.body.username,fullname:req.body.fullname,email:req.body.email});
	if(req.body.secretcode==="secretsiteadmin"){
		newUser.isSiteAdmin=true;
	}
	User.register(newUser,req.body.password,function(err,user){
		if(err){
			console.log(req.body);
			console.log(err);
			req.flash("error",err.message);
			res.redirect("/register");
			}
			passport.authenticate("local")(req,res,function(){
				var Transport=nodemailer.createTransport({
					service:"gmail",
					auth:{
						user:process.env.EMAIL,
						pass:process.env.PASSWORD
					}
				
				});
				var mailOptions={
					from:"learn.with.kumar.mumbai@gmail.com",
					to:req.body.email,
					subject:"Registration on Yelpcamp",
					text:"Hi "+req.body.username+",\nWelcome to YelpCamp"
				}
				Transport.sendMail(mailOptions,function(err){
					if(err){
						console.log(err);
					}else{
						console.log("mail sent");
					}
				})
				req.flash("success","Welcome to Yelpcamp "+user.username);
				res.redirect("/campground");
				});
		});
			
		
	});
	

//LOGIN SHOW FORM
router.get("/login",function(req,res){
	res.render("login");
});
//LOGIN HANDLING LOGIC
//app.post("/login",middleware ,callback)
router.post("/login",passport.authenticate("local",{
	successFlash: 'You are now logged in!',
	successRedirect: "/campground",
	failureFlash: 'Incorrect username or password',
	failureRedirect: "/login"
}),function(req,res){

	
	
});
//LOGOUT ROUTE
router.get("/logout",function(req,res){
	req.logout();
	req.flash("success","You are logged out successfully!");
	res.redirect("/campground");
});
//===============================================================//
//Update profile router
router.get("/user/:id/update",middleware.isLoggedIn,function(req,res){
	console.log(req.user);
	User.findById(req.params.id,function(err,foundUser){
		if(err){
			console.log(err);
		}
		else{
			console.log("user is"+foundUser);
			res.render("updateprofile",{user:foundUser})
		}
	});
	
	
	
});
router.put("/user/:id",middleware.isLoggedIn,function(req,res){
	User.findByIdAndUpdate(req.params.id,req.body.user,function(err,updateUser){
		
		//console.log(req.body.user);
		if(err){
			console.log(err);
		}
		else{
			req.flash("success","Profile Updated");
			res.redirect("/campground");
		}
		
	});
});
//===============================================================//
//===================================================================//
//FORGET PASSWORD ROUTE
router.get("/forgot",function(req,res){
	res.render("forgotPassword");
});
router.post("/forgot",function(req,res,next){
	async.waterfall([
		//creating token
		function(done){
			crypto.randomBytes(15,function(err,buff){
				var token=buff.toString('hex');
				done(err,token);
				console.log(token);
			});
		},
		//finding user by email
		function(token,done){
			User.findOne({email:req.body.email},function(err,user){
				console.log("the found user"+user);
				console.log(done);
				if(user){
					console.log(token);
					user.resetPasswordToken=token;
					user.resetPasswordExpires=Date.now()+3600000;//1 hr=3600000 milisecond
					console.log(Date(user.resetPasswordExpires));
					user.save(function(err){
					done(err,token,user);
					});
					console.log(user);
					
				}else{
					req.flash('error',"No user with this email!");
					res.redirect("/forgot");
				}
				//console.log("the user is"+user);
				
			});
		},
		//sending email to user
		function(token,user,done){
			console.log("email user" +user);
			var Transport=nodemailer.createTransport({
				service: 'gmail',
				auth:{
					user:process.env.EMAIL,
					pass:process.env.PASSWORD
				}
			});
			console.log("token is"+token);
			//console.log("the token is "+typeof(token.resetPasswordToken));
			var mailOptions={
				to: req.body.email,
				from: 'learn.with.kumar.mumbai@gmail.com',
				subject:"YelpCamp Password Reset",
				text:"Hi "+user.fullname+",\nClick on the below link to reset your password\n\n"+
				"https://yelpcampmumbai.run-ap-south1.goorm.io/reset/"+user.resetPasswordToken
			};
			Transport.sendMail(mailOptions,function(err){
				console.log("mail sent");
				req.flash("success","An e-mail has been sent to "+req.body.email+" to reset password");
				done(err,'done');
			});
		}
	],function(err){
		if(err){
			console.log(err);
		}
		res.redirect("/login");
		
	});
});
//reset password form
router.get("/reset/:token",function(req,res){
	//we have to find user with this token and check the expire of the link
	
	
	User.findOne({resetPasswordToken:req.params.token,resetPasswordExpires:{$gt:Date.now()}},function(err,user){
			console.log("reset user is"+user);
			if(user){
				res.render("reset",{token:req.params.token});
			}else{
				req.flash("error","Password reset link is invalid or link expired");
				res.redirect("/forgot");
			}
		
	});
});
router.post("/reset/:token",function(req,res){
	async.waterfall([
		function(done){
			//find user by token
			User.findOne({resetPasswordToken:req.params.token,resetPasswordExpires:{$gt:Date.now()}},function(err,user){
				// if(!user){
				// 	req.flash("error","Password reset token is invalid or token expired")

				// }
				//checking new and confirm password
				if(req.body.newpassword===req.body.confirmpassword){
					user.setPassword(req.body.newpassword,function(err){
						user.resetPasswordToken=undefined;
						user.resetPasswordExpires=undefined;
						user.save(function(err){
							
								done(err,user);
						});
					});
				}
				else{
					req.flash("error","password does not match");
					res.redirect("back");
				}

			});
			
		},
		function(user,done){
			var Transport=nodemailer.createTransport({
				service:"gmail",
				auth:{
					user:'learn.with.kumar.mumbai@gmail.com',
					pass:'Kumar1234'
				}
			});
			console.log("password user is"+user);
			var mailOptions={
				to:user.email,
				from:'learn.with.kumar.mumbai@gmail.com',
				subject:'Security Alert',
				text:'The password for your YelpCamp Account was changed recently.'
			};
			Transport.sendMail(mailOptions,function(err){
				if(err){
					console.log(err);
					
				}
				done(err,'done');
			});
		}
	],function(err){
		req.flash("success","Password reset successfully!")
		res.redirect("/login");
	});
});
	


module.exports=router;