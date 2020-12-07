var mongoose=require('mongoose');
var passportLocalMongoose=require('passport-local-mongoose');

var userSchema=new mongoose.Schema({
	username: {type:String,unique: true},
	fullname:String,
	email:{type:String,unique: true},
	resetPasswordToken: String,
	resetPasswordExpires: Date,
	password: String,
	isSiteAdmin:{type:Boolean,default: false}
	
});

userSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model("User",userSchema);