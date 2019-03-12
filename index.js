const express = require("express");
const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
const bodyParser = require("body-parser");
const async = require("asyncawait/async");
const await = require("asyncawait/await");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const database = require("./db");
const validator = require("validator");
const app = express();
const port = 3001;

const common = require("./common.js");

app.use(session({
	secret : "sssssshhhhhhhhhhphirkoihai",
	resave : true,
	saveUninitialized : true
}));

var db = null;


database.dbconnect().then(function(data){	
	app.listen(port, function() { 
		db = data;
		console.log("Server is listening on " + port);	
	});
}).catch(function(error){
	console.log(error);
});

// Middlewares

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended : false}));

var regExp = {
	aplhaspaces : /^[A-Za-z ]+$/i,
}

var url = "mongodb://localhost:27017/";

app.get("/api/sendmail", function(req, res) {
	var trasnporter = nodemailer.createTransport({
		service : "gmail",
		auth : {
			user : "vishalkumar750372@gmail.com",
			pass : "vishal@1997",
		}
	});

	var formData = {
		name : "Vishal Kumar",
		email : "vishal@incaendo.com",
		password : "12345678",
	}

	message = "<p> Hi <b>" + formData.name + "</b>, </p>";
	message+= "<p> You have successfully registered with us.</p>";
	message+= "<p> Login Credentials</p>";
	message+= "<p> Email : " + formData.email + "</p>";
	message+= "<p> Password : " + formData.password + "</p><br><br>";
	message+= "<p> Thank You....!</p>";
	message+= "<br>";

	var mailoptions = {
		from : "'Fred Foo 👻' <vishalkumar750372@gmail.com>",
		to : "vishal@incaendo.com",
		subject : "Node Mail Testing",
		html : message
	}

	trasnporter.sendMail(mailoptions, function(err, result) {
		if (err) {
			console.log(err);
			response = {
				status : "error",
				error : err
			}
			res.end(JSON.stringify(response));
		}else{
			response = {
				status : "success",
				message : "Mail sent successfully",
				return : result
			}

			res.end(JSON.stringify(response));
		}
	});
});

app.get("/signup", function(req, res) {
	res.sendFile(__dirname + "/views/signup.html");
});

app.get("/dashboard", function(req, res) { 
	if (req.session.email) {
		res.sendFile(__dirname + "/views/dashboard.html");
	}else{
		res.redirect("/login");
	}
});

app.get("/login", function(req, res) {
	res.sendFile(__dirname + "/views/login.html");
});

var emailExists = async function(email) {
	var data  = await common.checkEmailExist(db, email);
	return data;
};

app.post("/api/signup", async function(req, res) {

	var errors = {}; 
	
	res.set("Content-Type","JSON");

	if (typeof req.body.name == "undefined" || typeof req.body.email == "undefined" || typeof req.body.password == "undefined") {

		response = {
			status : "error",
			message : "Missing : Please include name, email and password",
		}
		return res.end(JSON.stringify(response));
	}

	if (req.body.name == "") {
		errors['name'] = "Name can not be blank.";
	}else{
		if (!regExp.aplhaspaces.test(validator.trim(req.body.name))) {
			errors['name'] = "Only alphabatical characters allowed";
		}
	}

	if (req.body.email == "") {
		errors['email'] = "Email can not be blank.";
	}else {
		if (!validator.isEmail(req.body.email)) {
			errors['email'] = "Email is not valid.";
		}

		const emailCheck = await emailExists(req.body.email);
		
		if (emailCheck == true) {
			errors['email'] = "Email already exists.";
		}	
	}

	if (req.body.password == "") {
		errors['password'] = "Password can not be blank.";
	}

	if (JSON.stringify(errors) != "{}") {
		response = {
			status : "error",
			errors : errors,
		}
		res.end(JSON.stringify(response));
	}else{

		var salt = bcrypt.genSaltSync(10);
		var formData = {
			name : req.body.name,
			email : req.body.email,
			password : req.body.password, 
			vote : 0, 
			salt : salt,
		}

		formData.password = bcrypt.hashSync(formData.password, salt); 

		// check if email already exists 
		db.collection("users").findOne({"email":req.body.email}, function(err, result) { 
			if (result !== null) {
				errors['email'] = "Email is already registered";
				response = {
					status : "error",
					errors : errors,
				}
				
				return res.end(JSON.stringify(response));
			}else{
				// insert into database
				db.collection("users").insertOne(formData, function(err, result) {
					if (err) console.log(err);
					// console.log("Data inserted " + result.insertedCount);
					response = {
						status : "success",
						message : "You have successfully registered with us. Now you may login.",
					}

					// send mail on successfull registration
					var to = formData.email;
					var from = "vishalkumar750372@gmail.com"; // to show from name -> "'From Name' <something@xyz.com>" 	;
					var subject = "Registration";
					var message = "<p> Hi <b>" + formData.name + "</b>, </p>";
						message+= "<p> You have successfully registered with us.</p><br>";
						message+= "<p> Login Credentials</p>";
						message+= "<p> Email : " + formData.email + "</p>";
						message+= "<p> Password : " + req.body.password + "</p><br><br>";
						message+= "<p> Thank You....!</p>";
						message+= "<br>";

					common.sendmail(to, from, subject, message);

					return res.end(JSON.stringify(response));
				});
			}
		});
	}
});

app.post("/api/login", function(req, res) {
	
	var errors = {};
	res.set("Content-Type","JSON");

	// check the request has email and password 
	if (typeof req.body.email == "undefined" || typeof req.body.password == "undefined") {
		response = {
			status : "error",
			message: "Missing : Please include email and password",
		}
		return res.end(JSON.stringify(response));
	}

	if (req.body.email == "") {
		errors['email'] = "Email can not be blank.";
	}

	if (req.body.password == "") {
		errors['password'] = "Password can not be blank.";
	}

	if (JSON.stringify(errors) != "{}") {
		response = {
			status : "error",
			errors : errors,
		}

		res.end(JSON.stringify(response));
	}else{
		var formData = {
			email : req.body.email,
			password : req.body.password,
		}

		db.collection("users").find({"email":formData.email}).toArray(function(err, result) {
			if (err) console.log(err);

			if (result.length > 0) {

				var salt = result[0].salt;
				var hash = result[0].password;

				var compare = bcrypt.compareSync(formData.password, hash);

				if (compare === true) {
					response = {
						status : "success",
						message : "You have successfully logged in.",
					} 

					req.session.email = result[0].email;
					req.session.logged_in = true;
					
					res.end(JSON.stringify(response));
				}else{
					response = {
						status : "error",
						errors : {
							"authentication" : "You have entered an invalid email or password.",
						},
					}
					
					res.end(JSON.stringify(response));
				}
			}else{
				response = {
					status : "error",
					errors : {
						"authentication" : "You have entered an invalid email or password.",
					},
				}
				
				res.end(JSON.stringify(response));
			} 
		});
	}
});

app.post("/api/vote", function(req, res) {

	res.set("Content-Type","JSON");

	var email = req.body.email;
	var vote = parseInt(req.body.vote);

	if (req.body.email && req.body.vote) {

		db.collection("users").updateOne({"email":email},{$set:{"vote" : vote}}, function(resultErr, result){
			if (resultErr) {
				console.log("Error occured while update : " + resultErr); 
				response = {
					status : "error",
					data : resultErr,
					message : "Error occured.",
				}
				
				return res.end(JSON.stringify(response)); 
			}else{

				if (result.matchedCount == 1) {
					response = {
						status : "success",
						// data : result,
						message : "Vote updated successfully",
					}
					
					res.end(JSON.stringify(response));
				}else{
					response = {
						status : "error", 
						message : "Data not found",
					}
					
					return res.end(JSON.stringify(response));
				}
			} 
		});
	}else{
		response = {
			status : "error",
			message : "Something went wrong.",
		}
		return res.end(JSON.stringify(response));
	}
});

// fetch all users expect the logged in user
app.get("/api/users", function(req, res) {

	res.set("Content-Type", "application/json"); 
	if (req.session.email) {
		var email = req.session.email;		

		var findCond = {};

		if (email != "undefined") {
			findCond = {
				'email' : {$nin : [email]}
			};
		}

		db.collection("users").find(findCond).sort({_id : -1}).toArray(function(err, result) {
			if (err) console.log(err);

			if (result.length > 0) {	
				response = {
					status : "success",
					data : result,
					message : "Records Found",
				}
			}else{
				response = {
					status : "error",
					data : [],
					message : "No Record Found.",
				};
			}

			res.end(JSON.stringify(response)); 
		});
	}else{
		response = {
			status : "error",
			data : [],
			message : "No Record Found.",
		};

		res.end(JSON.stringify(response));
	}
});

// fetch all users list
app.get("/api/listusers", function(req, res) {
	res.set("Content-Type","JSON");

	db.collection("users").find({}, { projection: { password:0, salt:0 }}).toArray(function(queryErr, result){
		response = {
			status: "success",
			data : result,
		}
		return res.end(JSON.stringify(response));
	});
});

// fetch a single user data from id
app.get("/api/user/:id",function(req, res){
	res.set("Content-Type","JSON");

	var findCond = {
		"_id" : new mongodb.ObjectID(req.params.id)
	}

	db.collection("users").find(findCond, { projection: { password:0, salt:0 }}).toArray(function(queryErr, result){
		response = {
			status: "success",
			data : result,
		}
		return res.end(JSON.stringify(response));
	}); 
});

// destroy session
app.get("/api/logout", function(req, res) {
	req.session.destroy();
	response = {
		status : "success",
		message : "User logout successfully.",
	}
	res.set("Content-Type","JSON");
	return res.end(JSON.stringify(response));
});