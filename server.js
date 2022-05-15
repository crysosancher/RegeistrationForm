const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const User = require('./model/user');
const bcrypt = require('bcrypt');
const jwt=require('jsonwebtoken');
mongoose.connect("mongodb://localhost:27017/login-app-db", {
	useNewUrlParser: true,
	useUnifiedTopology: true
}).catch(err => {
	console.log(err);
});
const app = express();
app.use("/", express.static(path.join(__dirname, "static")));
app.use(bodyParser.json());


app.post("/api/register", async (req, res) => {
	console.log("coming from post body:", req.body);
	//Hashing the password
	const { username, password: plainTextPassword } = req.body;
	//validation
	if (!username || !plainTextPassword) {
		return res.json({ status: "error", message: "username and password are required" });
	}
	if (!typeof username === "string" || !typeof plainTextPassword === "string") {
		return res.json({ status: "error", message: "username and password must be string" });
	}
	if (plainTextPassword.length < 8) {
		return res.json({ status: "error", message: "password must be at least 8 characters long" });
	}
	//used plaintext here so that we use password after initiilaiztion
	const password = await bcrypt.hash(plainTextPassword, 10);
	try {
		const response = await User.create({
			username,
			password
		})
		console.log("User created successfully", response);
	} catch (err) {
		if (err.code === 11000) {
			return res.json({ status: 'error', error: "Username already exists" });
		}
		// console.log(err.message);
		// return res.status({status: 'error'})
		throw err;
	}
	res.json({ status: "ok" });
});
app.post('/api/login', async (req, res) => {
	const { username, password } = req.body;
	const user= await User.findOne({username}).lean();
	if(!user){
		return res.json({status: 'error', error: 'User/Password not found'});
	}
	if(await bcrypt.compare(password.user.password)){
		return res.json({status: 'ok',data:'token'});
	}
        res.json({ status: "eroor",data:'User/Password not found' });
})

app.listen(3000, () => {
	console.log("server is running on port 3000");
});
