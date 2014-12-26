var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var Log = require('log');
var log = new Log('auth.google.passport');


var google = require('googleapis');

exports.setup = function (User, config) {

  passport.serializeUser(function(user, done) {
     done(null, user.id);
   });

  passport.use(new GoogleStrategy({
      clientID: config.google.clientID,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackURL
    },
    function(accessToken, refreshToken, profile, done) {

      log.debug('accessToken: ', accessToken);
      log.debug('refreshToken: ', refreshToken);

      //TODO we want to be able to also connect a google account to a previously existing user account

      User.findOne({
        'google.id': profile.id
      }, function(err, user) {

        if(user){
          //update the users access token
          user.accessToken = accessToken;
          user.refreshToken = refreshToken;

          user.save(function(err) {
            if (err) done(err);
            return done(err, user);
          });

        }
        else {


          //TODO turn into config list
          var email = profile.emails[0].value;
          var role = 'user';
          if(email === 'carson.bruce1@gmail.com'){
            role = 'admin';
          }

          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            accessToken: accessToken,
            refreshToken: refreshToken,
            role: role,
            username: profile.username,
            provider: 'google',
            google: profile._json
          });
          user.save(function(err) {
            if (err) done(err);
            return done(err, user);
          });
        }
      });
    }
  ));


};
