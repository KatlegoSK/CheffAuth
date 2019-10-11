'use strict';
const Utils = require('./utilities.js');
const hstatus = require('hapi-status'); //HTTP Status codes 
const Promise = require('bluebird'); //Promises for nodejs
const config = require('config');
const async = require('async');
const fs = require('fs');
const path = require('path');
const requestlib = require('request');
var Observable = require('rxjs');
const nodemailer = require('nodemailer');
var firebase = require("firebase");
var firestore = require('firebase/firestore');
var firebaseConfig = config.get('environment.firebase');

firebase.initializeApp(firebaseConfig);

module.exports = {

    onLogin: function (request, reply) {
        console.log("Call initiated : ", request.payload);
        var retObj = {

        };

        async.parallel([

            function (callback) {

                prepareLogin(request.payload.email, request.payload.password)

                    .then(response => {

                        console.log("Successfull login");
                        retObj = {

                            message: "Successfull login!"
                        }

                        callback(null, retObj)

                    }).catch(error => {

                        console.log("=====Login Error====");
                        console.log(error.message);
                        retObj = {

                            message: error.message
                        }

                        callback(null, retObj)

                    })



            }
        ],
            function (err, results) {

                var reqResponse = {
                    'body': retObj,
                    'details': 'success'
                };
                return hstatus.ok(reply, reqResponse);
            });

    },
    onRegister: function (request, reply) {
        console.log("Call initiated : ", request.payload);
        var retObj = {

        };

        async.parallel([

            function (callback) {

                prepareRegistration(request.payload.email, request.payload.password)

                    .then(response => {

                        retObj = {

                            message: "Successfull Registration!"
                        }

                        console.log("====Registration====");

                        callback(null, retObj)

                    }).catch(error => {

                        console.log("====Error ----  Registration====");
                        console.log(error.message);
                        retObj = {

                            message: error.message
                        }

                        callback(null, retObj)

                    })

            }
        ],
            function (err, results) {

                var reqResponse = {
                    'body': retObj,
                    'details': 'success'
                };
                return hstatus.ok(reply, reqResponse);
            });

    },
    onPassWordReset: function (request, reply) {
        console.log("Call initiated : ", request.payload);
        var retObj = {

        };

        async.parallel([

            function (callback) {

                preparePasswordReset(request.payload.email)

                    .then(response => {

                        console.log("====Password Reset====");

                        retObj = {

                            message: "A link for password reset has been sent to your email."
                        }



                        callback(null, retObj)

                    }).catch(error => {

                        console.log("====Error ----  Password Reset====");
                        console.log(error.message);
                        retObj = {

                            message: error.message
                        }

                        callback(null, retObj)

                    })

            }
        ],
            function (err, results) {

                var reqResponse = {
                    'body': retObj,
                    'details': 'success'
                };
                return hstatus.ok(reply, reqResponse);
            });

    },
    readRecipes: function (request, reply) {
        //console.log("Call initiated : ", request.payload);
        console.log("Initiated a call....");
        var retObj = {};

        async.parallel([

            function (callback) {

                let res = firebase.firestore().collection('recipes');
                res.onSnapshot((querySnapshot) => {
                    let boards = [];
                    querySnapshot.forEach((doc) => {
                        let data = doc.data();
                        boards.push({
                            key: doc.id,
                            name: data.userName,
                            userID: data.userId,
                            comments: data.comments,
                            content: data.content,
                            createdOn: data.createdOn
                            //img : data.recipeImage

                        });
                    });
                    retObj = boards;
                    callback(null, retObj)

                });


            }
        ],
            function (err, results) {

                var reqResponse = {
                    'body': retObj,
                    'details': 'success'
                };
                return hstatus.ok(reply, reqResponse);
            });

    },
    sendMail : function (request, reply) {
        //console.log("Call initiated : ", request.payload);
        console.log("Initiated a call....");
        var retObj = {};

        async.parallel([

            function (callback) {
                
                const transporter = nodemailer.createTransport({ 
                    service: 'Gmail',
                    auth: {
                      user: 'sendmessageresponse@gmail.com',
                      pass: 'SHerbbet@1011'
                    }
                  });

                  var mailOptions = {
                    from: 'sendmessageresponse@gmail.com',
                    to: request.payload.to,
                    subject: request.payload.subject,
                    text: request.payload.text
                  };

                  transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      console.log(error.response);
                      retObj.message = error.response;
                      callback(null, retObj);
                    } else {
                      console.log('Email sent: ' + info.response);
                      retObj.message = 'Email sent';
                      callback(null, retObj);
                    }
                  });

            }
        ],
            function (err, results) {

                var reqResponse = {
                    'body': retObj,
                    'details': 'success'
                };
                return hstatus.ok(reply, reqResponse);
            });

    }


}


function prepareLogin(email, password) {
    return firebase.auth().signInWithEmailAndPassword(email, password);
}

function prepareRegistration(email, password) {
    return firebase.auth().createUserWithEmailAndPassword(email, password);
}

function preparePasswordReset(email) {
    return firebase.auth().sendPasswordResetEmail(email);
}


function onReadRecipes() {
    return firestore.firestore().collection('recipes').snapshotChanges();
}