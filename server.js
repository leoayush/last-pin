var http = require('http');
var path = require('path');
var socketio = require('socket.io');
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var server = http.createServer(app);
var io = socketio.listen(server);
var db = require('./model/db');
var pin = require("./model/pins"); //singular
var pins = require('./routes/pins'); //plural
var board = require("./model/boards"); //singular
var boards = require("./routes/boards"); //plural
//////////////////////////////////Auth0/////////////////////////////////////////
var passport = require('passport');
var strategy = require('./setup-passport');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var requiresLogin = require('./requiresLogin');
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'views')));

app.use(cookieParser());
app.use(session({ secret: 'shhhhhhhhh', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
////////////////////////////////////////////////////////////////////////////////

app.use('/pins', pins);
app.use('/boards', boards);

app.get("/", function(req, res) {
  mongoose.model('Board').find({}, function (err, boards) {
    if (err) {
        return console.error(err);
    } else {
      res.render("index.ejs", {user: req.user, boards: boards});
    }
  });
});

app.get("/users/:id", function(req, res){
  var userDisplay = req.params.id;
  mongoose.model('Board').find({createdBy: userDisplay}, function (err, boards) {
    if (err) {
      return console.error(err);
    } else {
      mongoose.model('Pin').find({pinnedBy: userDisplay}, function (err, pins) {
        if (err) {
          return console.error(err);
        } else {
          res.render("user.ejs", {user: req.user, userDisplay: userDisplay, boards: boards, pins: pins});
        }
      });
    }
  });
});

app.get('/callback',
  passport.authenticate('auth0', { failureRedirect: '/' }),
  function(req, res) {
    if (!req.user) {
      throw new Error('user null');
    }
    res.redirect("/");
});


// server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
//   var addr = server.address();
//   console.log("Chat server listening at", addr.address + ":" + addr.port);
// });

app.listen(process.env.PORT);
console.log("Listening on port: " + process.env.PORT);
