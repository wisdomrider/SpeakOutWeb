var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var Issue = new Schema({
    name: {
        type: String,
        required: true
    },
    createdBy: {
        type: String,
        required: true
    }
});
module.exports = mongoose.model('Issue', Issue);