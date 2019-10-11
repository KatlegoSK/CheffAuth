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
var firebase = require("firebase");
var firestore = require('firebase/firestore');
var firebaseConfig = config.get('environment.firebase');
const settings = { timestampsInSnapshots: true };

firebase.initializeApp(firebaseConfig);
firebase.firestore().settings(settings);


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

    }


}

function onReadRecipes(ref) {
    let promise = new Promise((resolve, reject) => {

        let res = firebase.firestore().collection('recipes');
        res.onSnapshot((querySnapshot) => {
            let boards = [];
            querySnapshot.forEach((doc) => {
                let data = doc.data();
                boards.push({
                    key: doc.id,
                    name: data.userName,
                    userID: data.userId
                });
            });
        });

    })

    // async.parallel([

    //     function (callback) {



    //     }
    // ],
    //     function (err, results) {

    //         var reqResponse = {
    //             'body': retObj,
    //             'details': 'success'
    //         };
    //         return hstatus.ok(reply, reqResponse);
    //     });
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