const functions = require('firebase-functions');
const fbAdmin = require('firebase-admin');

fbAdmin.initializeApp({credential: fbAdmin.credential.cert(require('credential.json'))})
