const jwt = require('jwt-simple');
const User = require('../models/user');
const config = require('../config');

function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
}
exports.signin = function(req, res, next) {
  // already authed, just need to return token
  res.send({ token: tokenForUser(req.user)})
}

exports.signup = function(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(422).send({
      error: 'You must include an email and password'
    });
  }

  // check is user with email exists
  User.findOne({ email: email }, function(err, existingUser) {
    if (err) { return next(err); }

    // if a user with email exists, return error;
    if (existingUser) {
      return res.status(422).send({
        error: 'Email is in use'
      });
    }

    // if user does not exist, create and save user record
    const user = new User({
      email: email,
      password: password
    });

    user.save(function(err){
      if (err) { return next(err); }
      // respond to request indicating user was created
      res.json( {
        "token": tokenForUser(user)
      });
    });
  })
}
