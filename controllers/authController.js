const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
const bodyParser = require("body-parser");
const async = require("asyncawait/async");
const await = require("asyncawait/await");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const _ = require("lodash");
const common = require("../common.js");


let emailExists = async function(db, email) {
	let data  = await common.checkEmailExist(db, email);
	return data;
};

let sendJSONRespone = (res,content,status=null) => {
	res.set("Content-Type","JSON");
	res.end(content);
}

exports.signup = (req, res) => {
	res.sendFile(req.app.get('views') + "/signup.html");
};

exports.login = (req, res) => {
	res.sendFile(req.app.get('views') + "/login.html");
};

exports.create = async (req, res) => {
	const db = req.app.locals.db;

	let errors = {}; 

	let regExp = {
		aplhaspaces : /^[A-Za-z ]+$/i,
	}

	res.set("Content-Type","JSON");


	if (_.every(['name','email','password'], _.partial(_.has, req.body)) === false) {
		response = {
			status : "error",
			message : "Missing : Please include name, email and password",
		}
		return res.end(JSON.stringify(response));
	}


	if (req.body.name === '') {
	  errors['name'] = "Name can not be blank.";
	} else {
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

		const emailCheck = await emailExists(db, req.body.email);
		
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
	} else {

		let salt = bcrypt.genSaltSync(10);
		let formData = {
			name : req.body.name,
			email : req.body.email,
			password : req.body.password, 
			vote : 0, 
			salt : salt,
		}

		formData.password = bcrypt.hashSync(formData.password, salt); 

		// check if email already exists 
		db.collection("users").findOne({"email":req.body.email}, (err, result) => { 
			if (result !== null) {
				errors['email'] = "Email is already registered";
				response = {
					status : "error",
					errors : errors,
				}
				
				return res.end(JSON.stringify(response));
			}else{
				// insert into database
				db.collection("users").insertOne(formData, (err, result) => {
					if (err) console.log(err);
					// console.log("Data inserted " + result.insertedCount);
					response = {
						status : "success",
						message : "You have successfully registered with us. Now you may login.",
					}

					// send mail on successfull registration
					let to = formData.email;
					let from = "vishalkumar750372@gmail.com"; // to show from name -> "'From Name' <something@xyz.com>" 	;
					let subject = "Registration";
					let message = "<p> Hi <b>" + formData.name + "</b>, </p>";
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
};

exports.login_user = (req, res) => {
	let db = req.app.locals.db;
	let errors = {};
	res.set("Content-Type","JSON");

	// check the request has email and password 
	if (_.every(['email','password'], _.partial(_.has, req.body)) === false) {
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
		let formData = {
			email : req.body.email,
			password : req.body.password,
		}

		db.collection("users").find({"email":formData.email}).toArray(function(err, result) {
			if (err) console.log(err);

			if (result.length > 0) {

				let salt = result[0].salt;
				let hash = result[0].password;

				let compare = bcrypt.compareSync(formData.password, hash);

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
};
