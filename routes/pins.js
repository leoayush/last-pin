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
        mongoose.model('Pin').find({}, function (err, pins) {
            if (err) {
                return console.error(err);
            } else {
                res.render('pins/index', {pins: pins, user:req.user});
            }
        });
    })
    .post(function(req, res) {
        var refererArray = req.headers.referer.split("/");
        var boardID = refererArray[refererArray.length-1];
        var title = req.body.title;
        var source = req.body.source;
        var image = req.body.image;
        var description = req.body.description;
        var pinnedBy = req.user.displayName;
        mongoose.model('Pin').create({title: title, source: source, image: image, pinnedBy: pinnedBy, description: description, boardID: boardID}, function (err, pin) {
            if (err) {
                res.send("There was a problem adding the information to the database.");
            } else {
                res.redirect("/pins/" + pin._id);
            }
        })
    });
    

// router.get('/new', requiresLogin, function(req, res) {
//     res.render('pins/new', {user: req.user});
// });


router.param('id', function(req, res, next, id) {
    mongoose.model('Pin').findById(id, function (err, pin) {
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
    mongoose.model('Pin').findById(req.id, function (err, pin) {
        if (err) {
            console.log('GET Error: There was a problem retrieving: ' + err);
        } else {
            mongoose.model("Board").findById(pin.boardID, function(err, board){
               if (err) {throw err}
               res.render("pins/show", {pin: pin, board: board, user:req.user});
               res.end();
               return;
            });
        }
    });
});
  
  
  
router.get('/:id/edit', requiresLogin, function(req, res) {
    mongoose.model('Pin').findById(req.id, function (err, pin) {
        if (err) {
            console.log('GET Error: There was a problem retrieving: ' + err);
        } else {
            res.render("pins/edit", {pin: pin, user:req.user});
        }
    });
});




router.post('/:id/edit', function(req, res) {
    var title = req.body.title;
    var source = req.body.source;
    var image = req.body.image;
    var description = req.body.description;
    
    mongoose.model('Pin').findById(req.id, function (err, pin) {
        if (err) {
            console.log(err);
        }
        pin.update({
            title: title,
            source: source,
            image: image,
            description: description
        }, function (err, pinID) {
            if (err) {
                res.send("There was a problem updating the information to the database: " + err);
            } else {
                res.redirect("/pins/" + pin._id);
            }
        })
    });
});


router.delete('/:id/edit', function (req, res){
    mongoose.model('Pin').findById(req.id, function (err, pin) {
        if (err) {
            return console.error(err);
        } else {
            pin.remove(function (err, pin) {
                if (err) {
                    return console.error(err);
                } else {
                    res.redirect("/pins");
                }
            });
        }
    });
});


module.exports = router;