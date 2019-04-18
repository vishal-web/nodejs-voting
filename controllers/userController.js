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

exports.user = (req, res) => {
	let db = req.app.locals.db

	res.set("Content-Type","JSON");

	db.collection("users").find({}, { projection: { password:0, salt:0 }}).toArray((queryErr, result) => {
		response = {
			status: "success",
			data : result,
		}
		return res.end(JSON.stringify(response));
	});
};

exports.getuserbyid = (req, res) => {
	let db = req.app.locals.db

	res.set("Content-Type","JSON");

	var findCond = {
		"_id" : new mongodb.ObjectID(req.params.id)
	}

	db.collection("users").find(findCond, { projection: { password:0, salt:0 }}).toArray((queryErr, result) => {
		response = {
			status: "success",
			data : result,
		}
		return res.end(JSON.stringify(response));
	}); 
};