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
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser((id, done) => {
        db.collection('users').findOne(
        {_id: new ObjectID(id)},
        (err, doc) => {
            done(null, doc);
        });
    });

    passport.use(new LocalStrategy((username, password, done) => {
        db.collection('users').findOne(
            { username: username }, 
            (err, user) => {
                console.log('User ' + username + ' attempted to log in.');
                if(err) return done(err);
                if(!(user)) return done(null, false);
                //if(password !== user.password) return done(null, false);
                if(!(bcrypt.compareSync(password, user.password))) return done(null, false)
                return done(null, user);
        });
    }));
}