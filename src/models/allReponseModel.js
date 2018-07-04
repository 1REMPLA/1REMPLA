var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var allReponseSchema = new Schema({
    idRemplacant: {
        type: Schema.Types.ObjectId,
        ref: 'allRemplacant'
    },
    idAnnonce: {
        type: Schema.Types.ObjectId,
        ref: 'allAnnonce'
    },
    site: String,
    dates: [{
        annee: Number,
        jour: Number,
        mois: String,
        time: Number
    }],
    message: String,
    positive: Boolean,
    negative: Boolean
}, {versionKey: false});

var AllReponse = module.exports = mongoose.model('allReponse', allReponseSchema);