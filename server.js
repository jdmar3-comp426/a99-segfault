// Define app using express
var express = require("express") ;
var app = express() ;
 

// Require database SCRIPT file
var db = require("./database.js") ;

// Require md5 MODULE
var md5 = require("md5") ; 
//Requre cors module
const cors = require("cors");

// Make Express use its own built-in body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Make Express use CORS
app.use(cors()) ; 

// Set server port
var HTTP_PORT = 5000 ; 
// Start server
const server = app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
});
// READ (HTTP method GET) at root endpoint /app/
app.get("/app/", (req, res, next) => {
    res.json({"message":"Your API works! (200)"});
	res.status(200);
});

// Define other CRUD API endpoints using express.js and better-sqlite3
// CREATE a new user (HTTP method POST) at endpoint /app/new/

app.post("/app/new/", (req, res) => {	

	//const stmt = db.prepare("INSERT INTO userinfo (user,pass,email) VALUES (?,?,?) ON CONFLICT(user) DO UPDATE SET user=?") ;

	//const info = stmt.run(req.body.user, md5(req.body.pass),req.body.email,req.body.user);
	try{
		const stmt = db.prepare("INSERT INTO userinfo (username,password,email) VALUES (?,?,?)") ; 
		const info = stmt.run(req.body.username, req.body.password,req.body.email);
		res.status(201).json({"message" : "1 record created with username " + req.body.username + " (201)"}) ;
	}
	catch(error){
		res.status(404).json("Something went wrong") ; 
	}
	
	//const info = stmt.run(req.body.user, md5(req.body.pass),req.body.email);
	

	//console.log(req.body) ;

	 
});

// READ a list of all users (HTTP method GET) at endpoint /app/users/
app.get("/app/users", (req, res) => {	
	const stmt = db.prepare("SELECT * FROM userinfo").all();
	//console.log(stmt) ;
	res.status(200).json(stmt);
	
});

// READ a single user (HTTP method GET) at endpoint /app/user/:username
app.get("/app/user/:username", (req, res) => {	
	const stmt = db.prepare("SELECT * FROM userinfo WHERE username = '" + req.params.username +"'").get();
	res.status(200).json(stmt);
});

app.get("/app/user/exists/:username", (req, res) => {	
	const stmt = db.prepare("SELECT EXISTS(SELECT 1 FROM userinfo WHERE username = '" + req.params.username +"')").get();
	res.status(200).json(stmt);
});



// UPDATE a single user (HTTP method PATCH) at endpoint /app/update/user/:username
app.patch("/app/update/user/:username", (req, res) => {	
	const stmt = db.prepare("UPDATE userinfo SET username = COALESCE(?,username), password = COALESCE(?,password) , email = COALESCE(?,email) WHERE username = '" + req.params.username + "'") ; 
	const info = stmt.run(req.body.username, md5(req.body.password),req.body.email);  
	res.json({"message":"1 record updated: username " + req.params.username + " (200)"});
	res.status(200); 
})


// DELETE a single user (HTTP method DELETE) at endpoint /app/delete/user/:username
app.delete("/app/delete/user/:username", (req, res) => {	
	const stmt = db.prepare("DELETE FROM userinfo WHERE username = '" + req.params.username +"'").run();
	res.json({"message":"1 record deleted: username " + req.params.username + " (200)"});
	res.status(200) ; 
})

// Default response for any other request
app.use(function(req, res){
	res.json({"Your API works!":"Endpoint not found. (404)"});
    res.status(404);
});

process.on("SIGTERM" , () => {
	server.close( () => {
		console.log("Server stopped"); 
	} )
} )
