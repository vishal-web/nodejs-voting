# nodejs-voting
Api Doc - 

1. Signup

	Url - /signup
	Request Type - POST

	Fields -
	a. name
	b. email
	c. password 

	Response Example - 
	Success : 
	{
		status : "success",
		message : "You have successfully registered with us. Now you may login.",
	}

	Error : 
	{
	    "status": "error",
	    "errors": {
	        "name": "Name can not be blank.",
	        "email": "Email can not be blank.",
	        "password": "Password can not be blank."
	    }
	}

2. Login

	Url - /login
	Request Type - POST

	Fields - 
	a. email
	b. password

	Response Example - 
	Success : 
	{
		status : "success",
		message : "You have successfully logged in.",
	}

	Error : 
	{
	    "status": "error",
	    "errors": {
	        "email": "Email can not be blank.",
	        "password": "Password can not be blank."
	    }
	}

	Authentication Failed Error : 
	{
	    "status": "error",
	    "errors": {
	    	"authentication" : "Please enter a valid Email/password."
	    }
	}

	After successfull authentication user will go to Dashboard - Url - /dashboard


3.	Users List (Dashboard)
	
	Url - /listUser
	Request Type - GET

	Response Example - 

	Error : 
	{
	    "status": "error",
	    "data": [],
	    "message": "No Record Found."
	}

	Success :
	{
	    "status": "success",
	    "data": [
	        {
	            "_id": "5c7e741e41de2c53bf109887",
	            "name": "Test User",
	            "email": "test@gmail.com",
	            "password": "$2a$10$F1WJx9tcipE4NMP2z2KLYu/gbuyuyvhuY6PgVqjoQQRpU4aA6LdDa",
	            "vote": 0,
	            "salt": "$2a$10$F1WJx9tcipE4NMP2z2KLYu"
	        }
	    ],
	    "message": "Records Found"
	}

4. Vote

	Url - /vote
	Request Type - POST

	Fields - 
	a. email : test@gmail.com
	b. vote : 2 

	Response Example -

	Success :
	{
		"status":"success",
		"message":"Vote updated successfully"
	}

	Error : 
	{
	    	"status": "error",
	    	"message": "Data not found"
	}

5. Logout

	Url - /logout
	Request Type - GET
	
	Response
	{
		"status": "success",
		"message": "User logout successfully"
	}