importScripts("https://www.gstatic.com/firebasejs/9.6.7/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.6.7/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: 'AIzaSyBgSK0aYL-CJx1OpW-T9t4hnxvL0IwBPZM',
    authDomain: 'newbiefans-messaging.firebaseapp.com',
    projectId: 'newbiefans-messaging',
    storageBucket: 'newbiefans-messaging.appspot.com',
    messagingSenderId: '851451704159',
    appId: '1:851451704159:web:dd0b91be430856da66fcea'
});

const message = firebase.messaging();