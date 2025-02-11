const firebaseAdmin = require('firebase-admin');
const serviceAccount = require('./datamint-a6d58-firebase-adminsdk-fbsvc-84312a2d11.json');  // Path to the JSON key file

// Initialize Firebase Admin SDK
firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),  // Use the service account
    storageBucket: 'datamint-a6d58.appspot.com'  // Your Firebase Storage bucket
});

const bucket = firebaseAdmin.storage().bucket();

module.exports = { bucket };
