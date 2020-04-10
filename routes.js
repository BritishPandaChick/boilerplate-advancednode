const express     = require('express');
const bodyParser  = require('body-parser');
const fccTesting  = require('./freeCodeCamp/fcctesting.js');
const pug         = require("pug");
const session = require('express-session');
const passport = require('passport');
const ObjectID = require('mongodb').ObjectID;
const mongo = require('mongodb').MongoClient;
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');

module.exports = function(app, db) {
    const ensureAuthenticated = (req, res, next) => {
        if (req.isAuthenticated()) return next();
        res.redirect('/');
    }

    app.get('/', (req, res) => {
        res.render(process.cwd() + '/views/pug/index', {
          title: 'Home page', 
          message: 'Please login', 
          showLogin: true, 
          showRegistration: true
        });
    });
    
    app.post('/login', passport.authenticate('local', { failureRedirect: '/' }), (req, res) => {
        res.redirect('/profile');
    });

    app.get('/profile', ensureAuthenticated, (req, res) => {
        res.render(process.cwd() + '/views/pug/profile', {
          username: req.user.username
        });
    }); 

    app.route('/register')
      .post((req, res, next) => {

        db.collection('users').findOne({ username: req.body.username }, (err, user) => {
          if(err){
            next(err);
          } else if(user) {
            res.redirect('/');
          } else {
            //const hash = bcrypt.hashSync(req.body.password, 12);
            db.collection('users').insertOne({
              username: req.body.username,
              password: req.body.password
            }, (err, doc) => {
                if(err){
                  res.redirect('/');
                } else {
                  next(null, user);
                }
              });
          }
        });
    }, passport.authenticate('local', { failureRedirect: '/' }), 
        (req, res, next) => {
          res.redirect('/profile');
        });

    app.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/');
    });

    app.use((req, res, next) => {
      res.status(404)
        .type('text')
        .send('Not Found');
    });
}