var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Problem = new Schema({
    title: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now()
    },
    location: {
        type: String,
        required: true
    },
    createdBy: {
        type: String,
        required: true
    },
    photo: {
        type: String,
        required: false
    },
    tag: {
        type: String,
        required: true
    }, isApproved: {
        type: Boolean,
        required: false,
        default: false
    }, isSeen: {
        type: Boolean,
        required: false,
        default: false
    }
});
module.exports = mongoose.model('Problem', Problem);