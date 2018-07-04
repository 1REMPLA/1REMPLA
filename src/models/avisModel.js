var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var avisSchema = new Schema({
    idInstalle: {
        type: Schema.Types.ObjectId,
        ref: 'installe'
    },
    idRemplacant: {
        type: Schema.Types.ObjectId,
        ref: 'remplacant'
    },
    note: Number,
    commentaire: String
}, {versionKey: false});

var Avis = module.exports = mongoose.model('avis', avisSchema);
