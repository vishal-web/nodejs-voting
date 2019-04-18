const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const database = require('./db');
const app = express();
const port = 3001;


const appLoggerMiddleware = (req, res, next) => {
	// console.log('Logged '+ req.url + ' ' + req.method + ' -- ' + new Date);
	console.log(new Date, req.method, req.url);
	next()
}

app.use(appLoggerMiddleware);


// routes
const routes = require('./routes/index.js');

// view engine set
app.set('views', path.join(__dirname, 'views'));

// middlewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static('public'));

app.use(session({
	secret : "sssssshhhhhhhhhhphirkoihai",
	resave : true,
	saveUninitialized : true
}));

app.use('/', routes);



// server will listen once the database connection in established
let db = database.dbconnect().then((result) => {
	app.locals.db = result; 
	app.listen(port, () => {
		console.log("Server is listening on port " + port);
	});
}).catch((err) => {
	console.log(JSON.stringify(err));
});