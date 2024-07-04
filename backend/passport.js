const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./users'); 

module.exports = function (passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      User.findOne({ email })
        .then((user) => {
          if (!user) {
            return done(null, false, { message: 'Incorrect email or password.' });
          }

          bcrypt.compare(password, user.password).then((isMatch) => {
            if (!isMatch) {
              return done(null, false, { message: 'Incorrect email or password.' });
            }

            return done(null, user);
          });
        })
        .catch((err) => {
          return done(err);
        });
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
};

  