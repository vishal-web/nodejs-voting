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

exports.dashboard = (req, res) => {
	res.sendFile(req.app.get('views') + "/dashboard.html");
};

exports.users = (req, res) => {
	let db = req.app.locals.db;

	res.set("Content-Type", "application/json"); 
	if (req.session.email) {
		let email = req.session.email;		

		let findCond = {};

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
};

exports.vote = (req, res) => {
	let db = req.app.locals.db;
	res.set("Content-Type","JSON");

	let email = req.body.email;
	let vote = parseInt(req.body.vote);

	if (!req.session.email) {
		response = {
			status : "error",
			message : "Please login first.",
		}
		return res.end(JSON.stringify(response));
	}

	if (req.body.email && req.body.vote) {

		db.collection("users").updateOne({"email":email},{$set:{"vote" : vote}}, (resultErr, result) => {
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
};

exports.logout = (req, res) => {
	req.session.destroy();
	response = {
		status : "success",
		message : "User logout successfully.",
	}
	res.set("Content-Type","JSON");
	return res.end(JSON.stringify(response));
}