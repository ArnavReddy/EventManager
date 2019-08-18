var express = require("express");
var app = express();
var path = require("path");
var fs = require("fs");
var mongo = require("mongodb");
var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/";
var signInemail;
var signInpass;
var signUpemail;
var signUppass;
var aae;

app.get("/", function(req, res) {
    res.redirect("login.html");
});

app.use(express.static("public"));

app.get("/login.html", function(req, res) {
    res.sendFile(__dirname + "/" + "login.html");
});

displayUsers();

app.get("/process_signin", function(req, res) {
    signInemail = req.query.first_name;
    signInpass = req.query.last_name;
    console.log("sign in: " + signInemail + ", " + signInpass);
});

app.get("/process_signup", function(req, res) {
    signUpemail = req.query.first_name;
    signUppass = req.query.last_name;

    console.log("sign up: " + signUpemail + ", " + signUppass);

    check();
});

function addAccount() {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        var myobj = {
            username: signUpemail,
            password: signUppass
        };
        dbo.collection("Users").insertOne(myobj, function(err, res) {
            if (err) throw err;
            console.log("1 document inserted");
            db.close();
        });
    });
    displayUsers();
}

function displayUsers() {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        dbo.collection("Users")
            .find({})
            .toArray(function(err, result) {
                if (err) throw err;
                db.close();
            });
    });
}

function check() {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        var query = {
            username: signUpemail
        };
        console.log("username " + signUpemail);
        dbo.collection("Users")
            .find(query)
            .toArray(function(err, result2) {
                if (err) throw err;
                console.log(JSON.stringify(result2[0]));
            console.log(!result2[0]);
                if (!result2[0]) {
                    addAccount();
                }
                db.close();
            });
    });
}

var server = app.listen(8081, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log("Example app listening at http://%s:%s", host, port);
});
