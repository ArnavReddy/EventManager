var express = require("express");
var app = express();
var path = require("path");
var fs = require("fs");
var mongo = require("mongodb");
var MongoClient = require("mongodb").MongoClient;
var nodemailer = require('nodemailer');
var url = "mongodb://localhost:27017/";
var signInemail, signInpass, signUpemail, signUppass, login;
var eventName, eventDesc, eventDate, eventPriv;
var curEventName, curEventDesc, curEventDate;
var allEvents = [];
var myEvents = [];

var transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'handlerevent394@gmail.com',
        pass: 'Joshismegagay1'
    }
});


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
                    //res.redirect("/events.html");
                    db.close();
                });
        });
    }
});

app.get("/process_signup", function(req, res) {
    signUpemail = req.query.first_name;
    signUppass = req.query.last_name;


    check();

    function check() {
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("mydb");
            var query = {
                username: signUpemail
            };
            dbo.collection("Users")
                .find(query)
                .toArray(function(err, result2) {
                    if (err) throw err;

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
                    dbo.collection("Events").insertOne(myobj, function(err, r) {
                        if (err) throw err;
                        res.redirect("/events.html");
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
    socket.name = signInemail;
    socket.on('curEventDate', function(curEventDate1) {
        curEventDate = curEventDate1;
    })
    socket.on('curEventName', function(curEventName1) {
        curEventName = curEventName1;
    })
    socket.on('curEventDesc', function(curEventDesc1) {
        curEventDesc = curEventDesc1;
    })

    socket.on('display', function(username) {
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("mydb");
            dbo.collection("Events")
                .find({})
                .toArray(function(err, result) {
                    if (err) throw err;
                    for (var i = 0; i < result.length; i++) {

                        if (result[i].username != socket.name && result[i].username != null) allEvents[i] = result[i];



                    }

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

                        myEvents[i] = result2[i];



                    }

                    socket.emit('myevents', myEvents);

                    db.close();
                });

        });
    });


    app.get("/process_deleteEvent", function(req, res) {
        var deletedEvent = req.query.deletedEvent;
        console.log("DELETE: " + deletedEvent)
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("mydb");

            var query = {
                username: signInemail,
                eventname: deletedEvent
            };

            dbo.collection("Events")
                .find(query)
                .toArray(function(err, result2) {
                    if (err) throw err;

                    if (!result2[0]) {

                    } else {
                        var myquery = { eventname: deletedEvent };
                        dbo.collection("Events").deleteOne(myquery, function(err, obj) {
                            if (err) throw err;
                            console.log("deleted event : " + myquery)
                            res.redirect("/events.html");
                            db.close();
                        });
                    }

                    db.close();
                });
        });


    });

    app.get("/addFriends", function(req, res) {
        var email = req.query.friend_email;
        var mailOp = {
            from: 'handlerevent394@gmail.com',
            to: email,
            subject: 'Invited to ' + curEventName + ' hosted by ' + socket.name,
            text: 'Hey there! You have been graciously invited to ' + curEventName + ' by ' + socket.name + ' . It is' +
                ' ' + curEventDesc + ' and it is being held on ' + curEventDate + '. You see more details at localhost:8081/login.html .'

        };

        transport.sendMail(mailOp, function(error, info) {
            if (error) {} else {}
        });
        res.redirect('/events.html');



        check();

        function check() {
            MongoClient.connect(url, function(err, db) {
                if (err) throw err;
                var dbo = db.db("mydb");
                var query = {
                    recipient: email,
                    sender: signInemail,
                    eventname: curEventName
                };
                dbo.collection("Invites")
                    .find(query)
                    .toArray(function(err, result2) {
                        if (err) throw err;

                        if (!result2[0]) {
                            addFriend();
                        }
                        db.close();
                    });
            });
        }

        function addFriend() {
            MongoClient.connect(url, function(err, db) {
                if (err) throw err;
                var dbo = db.db("mydb");
                var myobj = {
                    recipient: email,
                    sender: signInemail,
                    eventname: curEventName,
                    eventdate: curEventDate,
                    eventdesc: curEventDesc
                };
                dbo.collection("Invites").insertOne(myobj, function(err, res) {
                    if (err) throw err;
                    db.close();
                });
            });
        }

    });

})