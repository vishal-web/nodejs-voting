const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient; 

let db;
let url = "mongodb://localhost:27017";

const getItems = function() {
	return new Promise(function(resolve, reject){
		setTimeout(function() {
			resolve(['A', 'B', 'C', 'D']);
		}, 2000);
	});
}

const dbconnect = function() {
	return new Promise(function(resolve, reject) {
		MongoClient.connect(url, {useNewUrlParser : true}, function(connectErr, client){
			if (connectErr) {
				response = {
					"status": "error",
					"error" : connectErr,
					"message": "Database connection failed",
				}

				reject(response);
				/*console.log(JSON.stringify(response));
				process.exit();*/
			}else{
				console.log("Database connection established");
				db = client.db("mydb");  
				resolve(db);
			}
		}); 
	}); 
}


module.exports = {
	dbconnect : dbconnect,
	db : db
};