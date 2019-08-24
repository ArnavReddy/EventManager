var express = require("express");
var app = express();
var path = require("path");
var fs = require("fs");
var mongo = require("mongodb");
var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/";
var signInemail, signInpass, signUpemail, signUppass, login, eventName, eventDesc, eventDate, eventPriv;
var allEvents = [];
var myEvents = [];


app.get("/", function(req, res) {
    res.redirect("login.html");
});

app.use(express.static("public"));

app.get("/login.html", function(req, res) {
    res.sendFile(__dirname + "/" + "login.html");
});
app.get("/events.html", function(req, res) {
    res.sendFile(__dirname + "/" + "events.html");
});



app.get("/process_signin", function(req, res) {
    signInemail = req.query.first_name;
    signInpass = req.query.last_name;
    console.log("sign in: " + signInemail + ", " + signInpass);
    checkLogin();

    function checkLogin() {
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("mydb");
            var query = {
                username: signInemail,
                password: signInpass
            };
            dbo.collection("Users")
                .find(query)
                .toArray(function(err, result) {
                    if (err) throw err;
                    if (result[0]) {
                        login = true;
                        res.redirect("events.html");
                    } else {
                        login = false;
                    }
                    console.log("login + " + login);
                    db.close();
                });
        });
    }
});

app.get("/process_signup", function(req, res) {
    signUpemail = req.query.first_name;
    signUppass = req.query.last_name;

    console.log("sign up: " + signUpemail + ", " + signUppass);

    check();

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

                    if (!result2[0]) {
                        addAccount();
                    }
                    db.close();
                });
        });
    }

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
});



app.get("/process_addEvent", function(req, res) {
    eventName = req.query.event_name;
    eventDesc = req.query.event_desc;
    eventDate = req.query.event_date;
    if (req.query.event_privacy === "on") eventPriv = "private"
    else eventPriv = "public"

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        var myobj = {
            eventname: eventName,
            eventdescription: eventDesc,
            username: signInemail,
            eventdate: eventDate,
            eventprivacy: eventPriv
        };

        var query = {
            username: signInemail,
            eventname: eventName

        };

        dbo.collection("Events")
            .find(query)
            .toArray(function(err, result2) {
                if (err) throw err;

                if (!result2[0]) {
                    dbo.collection("Events").insertOne(myobj, function(err, res) {
                        if (err) throw err;
                        console.log("1 document inserted");
                        db.close();
                    });
                }
                db.close();
            });
    });

});


var server = app.listen(8081, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log("Example app listening at http://%s:%s", host, port);
});

var io = require('socket.io')(server);
io.on('connection', function(socket) {
    socket.emit('username', signInemail);

    socket.on('display', function(username) {
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("mydb");
            dbo.collection("Events")
                .find({})
                .toArray(function(err, result) {
                    if (err) throw err;
                    for (var i = 0; i < result.length; i++) {

                        allEvents[i] = JSON.stringify(result[i].eventname);
                        //console.log(JSON.stringify(result[i].eventname));



                    }

                    //console.log("All events: " + JSON.stringify(allEvents));
                    socket.emit('allevents', allEvents);

                    db.close();
                });


        });

        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("mydb");

            var query = {
                username: signInemail

            };

            dbo.collection("Events")
                .find(query)
                .toArray(function(err, result2) {
                    if (err) throw err;
                    for (var i = 0; i < result2.length; i++) {

                        myEvents[i] = JSON.stringify(result2[i].eventname);
                        //console.log(JSON.stringify(result[i].eventname));



                    }

                    //console.log("All events: " + JSON.stringify(allEvents));
                    socket.emit('myevents', myEvents);

                    db.close();
                });

        });
    });



})