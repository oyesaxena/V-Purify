const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const ejs = require("ejs");
var multer  = require('multer')
const mongoose=require("mongoose");
const app = express();


// body parser middleware
app.use(express.json());
app.use(express.urlencoded( { extended: false } )); // this is to handle URL encoded data
app.use(bodyParser.urlencoded({extended: true}));

var Storage = multer.diskStorage({
	destination: "public/uploads/",
	filename: (req,file,cb)=>{
	  cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname));
  
	}
  })
  var upload = multer({
	storage:Storage
  }).single('img');

// end parser middleware
app.set('view engine', 'ejs');
mongoose.connect("mongodb+srv://admin-V:test123@v-purify-xaumc.mongodb.net/V-Purify", {useNewUrlParser: true, useUnifiedTopology:true});

// custom middleware to log data access
const log = function (request, response, next) {
	console.log(`${new Date()}: ${request.protocol}://${request.get('host')}${request.originalUrl}`);
	console.log(request.body); // make sure JSON middleware is loaded first
	next();
}
app.use(log);
// end custom middleware


// enable static files pointing to the folder "public"
// this can be used to serve the index.html file
app.use(express.static("public"));

const blogSchema = {
    title: String,
    // image: { 
    //     data: Buffer, 
    //     contentType: String
    //      } ,
    content: String,
    image:String,
  };

const Blog = mongoose.model("Blog", blogSchema);  

app.get("/",function(req,res){
	Blog.find({}, function(err, blogs){
		res.render("home", {
		  blogs: blogs
		  });
	  }).limit(3).sort({$natural:-1})
})

app.get("/write",function(req,res){
	res.render("write")
})

app.get("/blogsPage",function(req,res){
	Blog.find({}, function(err, blogs){
		res.render("blogsPage", {
		  blogs: blogs
		  });
	  });
})
app.get("/blogs/:blogId", function(req, res){

	const requestedBlogId = req.params.blogId;
	
	  Blog.findOne({_id: requestedBlogId}, function(err, blog){
		res.render("blogs", {
		//   image: blog.image,
		  title: blog.title,
		  content: blog.content
		});
	  });
	
	});



app.post("/write",upload,  function(req,res){
  
	const blog= new Blog({
	  title:req.body.blogTitle,
	  content:req.body.blogBody,
	  image:req.file.filename
	});
  
	blog.save(function(err){
	  if (!err){
		  res.redirect("/");
	  }
	});
  })


// set port from environment variable, or 8000
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log(`listening on port ${PORT}`));
