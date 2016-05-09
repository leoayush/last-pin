var passport = require('passport');
var Auth0Strategy = require('passport-auth0');

var strategy = new Auth0Strategy({
    domain:       'nightlife-coordinator.auth0.com',
    clientID:     'SxtNJGuShwfG4sL3Q3D5cvGjwEiPSrfh',
    clientSecret: '4lmg0ep_3yvomWfIbg6frs76ByG0-GBfZfAe75nGN321hi_GKuUHzALhWFQ1Vi3X',
    callbackURL:  'http://sleepy-fortress-1709.herokuapp.com/callback'
  }, function(accessToken, refreshToken, extraParams, profile, done) {
    // accessToken is the token to call Auth0 API (not needed in the most cases)
    // extraParams.id_token has the JSON Web Token
    // profile has all the information from the user
    return done(null, profile);
  });

passport.use(strategy);

// This is not a best practice, but we want to keep things simple for now
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

module.exports = strategy;