var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var User = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    gender: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: false
    }
    , role: {
        type: String,
        default: "User"
    },
    location: {
        type: String,
        required: false
    }, tags: {
        type: String,
        required: false
    }, fcm: {
        required: false,
        type: String
    }
});
module.exports = mongoose.model('User', User);