var mongoose=require('mongoose');
//Comment MODEL
var commentSchema=new mongoose.Schema({
	text: String,
	author:{
		id:{
			type:mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	} ,
	comment_date:Date
});

module.exports=mongoose.model("Comment",commentSchema);

