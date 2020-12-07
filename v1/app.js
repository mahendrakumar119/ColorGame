var express              =require("express"),
	app                  =express(),
	bodyParser           =require("body-parser"),
	mongoose             =require("mongoose"),
	flash				 =require("connect-flash"),
	passport             = require('passport'),
	LocalStrategy        =require('passport-local'),
	methodOverride       =require('method-override'),
	passportLocalMongoose=require('passport-local-mongoose'),
	Campground           = require('./models/campground'),
	Comment              =require('./models/comment'),
	User                 =require('./models/user'),
	seedDB               =require('./seeds');
//importing routes
var commentRoutes  =require('./routes/comments');
var campgroudRoutes=require('./routes/campgrounds');
var indexRoutes     =require('./routes/index');
//it will be executed every time server starts
//seedDB(); //seed the database
//flash packages for showing messages
//connecting to yelp_camp database or mongodb

mongoose.connect("mongodb://localhost:27017/yelp_camp",{useNewUrlParser: true,useUnifiedTopology: true,useFindAndModify: false});

//bodyParser is used to get and send, form data and to send data respectively 
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static(__dirname+"/public"));
app.use(methodOverride("_method"));
app.use(flash());

//PASSPORT CONGIGURATION
app.use(require('express-session')({
	secret: "this is mahendra",
	resave: false,
	saeUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//middleware for currently loggedin user and it will be called on every route
app.use(function(req,res,next){
	res.locals.currentUser=req.user;
	res.locals.error=req.flash("error");
	res.locals.success=req.flash("success");
	next();
});
//TELLING EXPRESS APP TO USE ROUTES
app.use(commentRoutes);
//ROUTE REFACRING AS /campground is common in all the campground routes
app.use("/campground",campgroudRoutes);
app.use(indexRoutes);


//server listen
app.listen(process.env.PORT ,process.env.IP,function(){
	console.log("Yelp Camp Server Has Started!");
});

// ******RESTFUL ROUTES******
// name		url               verb 				description
// =======================================================
// INDEX       /campground	 	 GET               Show all the campgrounds from mongodb
// New         /campground/new  GET               shows form for new campground
// CREATE      /campground      POST              adds new campground to the database
// SHOW        /campground/:id  GET               show more info about campground

