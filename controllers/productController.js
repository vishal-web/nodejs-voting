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


exports.create = (req, res) => { 
	res.set('Content-Type','JSON'); 

	let result = [];

	if (typeof req.body.product !== 'undefined') {
		result = req.body.product;
	}
	console.log(req.body.product);

	response = {
		status: "success",
		data : result,
	}

	return res.end(JSON.stringify(response));
}

exports.addProduct = (req, res) => {
	res.set('Content-Type' , 'JSON');

	let result = []; 

	let db = req.app.locals.db;

	let insertData = {
		'product_name' : req.body.product_name,
		'price' : req.body.price,
		'price' : req.body.price,
		'description' : req.body.description
	}

	db.collection('product').insertOne(insertData, (err, result) => {
		if (err) {
			response = {
				status: "error",
				data : result,
			};
		} else {
			response = {
				status: "success",
				data : result,
			};
		}
		return res.end(JSON.stringify(response));
	});
}

exports.product = (req, res) => {
	res.set('Content-Type','JSON');
	res.setHeader('Access-Control-Allow-Origin', '*');
	let db = req.app.locals.db;

	db.collection('product').find({}).toArray((err, result)  => {
 
		if (err) {
			response = { status: "error",data : err};
		} else {
			response = { status: "success",data : result};
		}

		return res.end(JSON.stringify(response));
	})
}