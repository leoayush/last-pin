var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    requiresLogin = require("../requiresLogin");
    
    
router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function(req, res){
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        var method = req.body._method
        delete req.body._method
        return method
    }
}))



router.route('/')
    .get(function(req, res, next) {
        mongoose.model('Board').find({}, function (err, boards) {
            if (err) {
                return console.error(err);
            } else {
                res.render('boards/index', {boards: boards, user:req.user});
            }
        });
    })
    .post(function(req, res) {
        var boardName = req.body.boardName;
        var boardDescription = req.body.boardDescription;
        var createdBy = req.user.displayName;
        mongoose.model('Board').create({
            boardName: boardName,
            boardDescription: boardDescription,
            createdBy: createdBy
        }, function (err, board) {
            if (err) {
                res.send("There was a problem adding the information to the database.");
            } else {
                res.redirect("/boards/" + board._id);
            }
        })
    });
    
    
router.get('/new', requiresLogin, function(req, res) {
    res.render('boards/new', {user: req.user});
});



router.param('id', function(req, res, next, id) {
    mongoose.model('Board').findById(id, function (err, board) {
        if (err) {
            console.log(id + ' was not found');
            res.status(404)
            var err = new Error('Not Found');
            err.status = 404;
        } else {
            req.id = id;
            next(); 
        } 
    });
});


router.route('/:id').get(function(req, res) {
    mongoose.model('Board').findById(req.id, function (err, board) {
        if (err) {
            console.log('GET Error: There was a problem retrieving: ' + err);
        } else {
            mongoose.model("Pin").find({boardID: req.id}, function(err, pins){
               if (err) {throw err}
               var pins = pins;
               res.render("boards/show", {board: board, pins: pins, user:req.user});
            });
        }
    });
});
  
  
  
router.get('/:id/edit', requiresLogin, function(req, res) {
    mongoose.model('Board').findById(req.id, function (err, board) {
        if (err) {
            console.log('GET Error: There was a problem retrieving: ' + err);
        } else {
            res.render("boards/edit", {board: board, user:req.user});
        }
    });
});


router.post('/:id/edit', function(req, res) {
    var boardName = req.body.boardName;
    var boardDescription = req.body.boardDescription;

   //find the document by ID
    mongoose.model('Board').findById(req.id, function (err, board) {
        if (err) {console.log(err)}
        board.update({
            boardName: boardName,
            boardDescription: boardDescription
        }, function (err, boardID) {
            if (err) {
                res.send("There was a problem updating the information to the database: " + err);
            } else {
                res.redirect("/boards/" + board._id);
            }
        })
    });
});


router.delete('/:id/edit', function (req, res){
    mongoose.model('Board').findById(req.id, function (err, board) {
        if (err) {
            return console.error(err);
        } else {
            board.remove(function (err, board) {
                if (err) {
                    return console.error(err);
                } else {
                    mongoose.model('Pin').find({boardID: req.id}, function (err, pins) {
                        if (err) {
                            return console.error(err);
                        } else {
                            pins.forEach(function(pin){
                               pin.remove(function (err, pin) {
                                    if (err) {
                                        return console.error(err);
                                    } else {
                                        return;
                                    }
                                }); 
                            });
                            res.redirect("/boards");
                        }
                    });
                }
            });
        }
    });
});


module.exports = router;