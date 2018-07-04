var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var allAnnonceSchema = new Schema({
    idInstalle: {
        type: Schema.Types.ObjectId,
        ref: 'allInstalle'
    },
    idRemplacant: {
        type: Schema.Types.ObjectId,
        ref: 'allRemplacant'
    },
    idSite: {
        type: Schema.Types.ObjectId,
        ref: 'allSite'
    },
    idZonesGeo: {
        type: Schema.Types.ObjectId,
        ref: 'allZoneGeo'
    },
    periodes: [{
        dateDebut: Date,
        dateFin: Date
    }]
}, {versionKey: false});

var AllAnnonce = module.exports = mongoose.model('allAnnonce', allAnnonceSchema);