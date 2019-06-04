const nodemailer = require("nodemailer");

module.exports = {
	sendmail : function(to, from, subject, message) {
		var transporter = nodemailer.createTransport({
			service : "gmail",
			auth : {
				user : "someone@gmail.com",
				pass : "**********",
			}
		});

		var mailoptions = {
			from : from,
			to : to,
			subject : subject,
			html : message
		}

		transporter.sendMail(mailoptions, function(err, result) {
			var response;
			if (err) {
				response = {
					status : "error",
					error : err
				} 
				console.log("\nMail Status " + JSON.stringify(response));
			}else{
				response = {
					status : "success",
					message : "Mail sent successfully",
					data : result
				}
				console.log("\nMail Status " + JSON.stringify(response));  
			} 
		});
	},

	checkEmailExist : function(db, email) {		
		return new Promise((resolve, reject) => {
			db.collection("users").findOne({"email":email}, function(err, result) {
				if (err) {
					reject(err);
				}else{
					resolve(result !== null ?  true : false); 
					// return result !== null ?  true : false; 
				}
			}); 
		});
	},

	checkAlreadyExist : function(db, collection, condition) {
		return new Promise((resolve, reject) => {
			db.collection(collection).findOne(condition, function(err, result) {
				if (err) {
					reject(err);
				}else{
					resolve(result !== null ?  true : false); 
					// return result !== null ?  true : false; 
				}
			}); 
		});
	},
}