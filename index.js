const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const app = express();;
const port = 3001;


app.use(session({
	secret : "sssssshhhhhhhhhhphirkoihai",
	resave : true,
	saveUninitialized : true
}));
	
var url = "mongodb://localhost:27017/";


app.get("/signup", function(req, res) {
	res.sendFile(__dirname + "/views/signup.html");
});

var urlencodedParser = bodyParser.urlencoded({extended : false});

checkEmailExist = function(email) {
	MongoClient.connect(url, {useNewUrlParser : true}, function(err ,db) {
		if (err) console.log(err);
		dbo = db.db("mydb");

		dbo.collection("users").findOne({"email":email}, function(err, result) {
			console.log(result);
			return result == "null" ? "true" : "false";
			db.close();
		});
	});
}

app.post("/signup", urlencodedParser, function(req, res) {

	var errors = {};
	if (req.body.name == "") {
		errors['name'] = "Name can not be blank.";
	}

	if (req.body.email == "") {
		errors['email'] = "Email can not be blank.";
	}else{
		/*var emailExist = checkEmailExist(req.body.email); 
		if (emailExist == "false") {
			errors['email'] = "Email is already registered.";	
		}*/
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

		MongoClient.connect(url, {useNewUrlParser : true}, function(err ,db) {
			if (err) console.log(err);
			dbo = db.db("mydb");

			dbo.collection("users").insertOne(formData, function(err, result) {
				if (err) console.log(err);
				// console.log("Data inserted " + result.insertedCount);
				response = {
					status : "success",
					message : "You have successfully registered with us. Now you may login.",
				}

				res.end(JSON.stringify(response));
				db.close();
			});
		});
	}
});

app.post("/login", urlencodedParser, function(req, res) {
	
	var errors = {};

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

		MongoClient.connect(url, {useNewUrlParser : true}, function(err ,db) {
			if (err) console.log(err);
			dbo = db.db("mydb");

			dbo.collection("users").find({"email":formData.email}).toArray(function(err, result) {
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
						db.close();
					}else{
						response = {
							status : "error",
							errors : {
								"authentication" : "Please enter a valid Email/password.",
							},
						}

						res.end(JSON.stringify(response));
						db.close();
					}
				}else{
					response = {
						status : "error",
						errors : {
							"authentication" : "Please enter a valid Email/password.",
						},
					}

					res.end(JSON.stringify(response));
					db.close();
				} 
			});
		});
	}
});

app.post("/vote", urlencodedParser, function(req, res) {

	var email = req.body.email;
	var vote = parseInt(req.body.vote);


	if (req.body.email && req.body.vote) {
		
		MongoClient.connect(url, {useNewUrlParser : true}, function(err, db){
			if (err) console.log(err);
			dbo = db.db("mydb"); 

			dbo.collection("users").updateOne({"email":email},{$set:{"vote" : vote}}, function(resultErr, result){
				if (resultErr) {
					console.log("Error occured while update : " + resultErr); 
					response = {
						status : "error",
						data : resultErr,
						message : "Error occured.",
					}

					db.close();
					res.end(JSON.stringify(response)); 
				}else{
					console.log(result.matchedCount);

					if (result.matchedCount == 1) {
						response = {
							status : "success",
							// data : result,
							message : "Vote updated successfully",
						}
						db.close();
						res.end(JSON.stringify(response));
					}else{
						response = {
							status : "error", 
							message : "Data not found",
						}
						db.close();
						res.end(JSON.stringify(response));
					}
				} 
			});
		});
	}else{
		response = {
			status : "error",
			message : "Something went wrong.",
		}
		res.end(JSON.stringify(response));
	}
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


// fetch all users
app.get("/listUser", function(req, res) {

	if (req.session.email) {
		var email = req.session.email;

		MongoClient.connect(url, {useNewUrlParser : true}, function(err ,db) {
			if (err) console.log(err);
			dbo = db.db("mydb");

			var findCond = {};

			if (email != "undefined") {
				findCond = {
					'email' : {$nin : [email]}
				};
			}

			dbo.collection("users").find(findCond).toArray(function(err, result) {
				if (err) console.log(err);
				
				if (result.length > 0) {
					
					response = {
						status : "success",
						data : result,
						message : "Records Found",
					}

					res.set("Content-Type", "application/json");		
					res.end(JSON.stringify(response));
				}else{
					response = {
						status : "error",
						data : [],
						message : "No Record Found.",
					};

					res.set("Content-Type", "application/json");
					res.end(JSON.stringify(response));
				} 
				db.close(); 
			});
		});	

	}else{
		response = {
			status : "error",
			data : [],
			message : "No Record Found.",
		};

		res.set("Content-Type", "application/json");
		res.end(JSON.stringify(response));
	}
});


// destroy session
app.get("/logout", function(req, res) {
	req.session.destroy();
	res.redirect("/login");
});

app.listen(port, function() {
	console.log("Server is listening on " + port);	
});