var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";


//MongoClient.connect(url, function(err, db) {
//if (err) throw err;
//console.log("Database created!");
//db.close();
//});



//MongoClient.connect(url, function(err, db) {
//if (err) throw err;
//var dbo = db.db("mydb");
//dbo.createCollection("Users", function(err, res) {
//if (err) throw err;
//console.log("Collection created!");
//db.close();
//});
//});

MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    dbo.createCollection("Events", function(err, res) {
        if (err) throw err;
        console.log("Collection created!");
        db.close();
    });
});