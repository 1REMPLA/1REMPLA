var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var allEvenementSchema = new Schema({
    idInstalle: {
        type: Schema.Types.ObjectId,
        ref: 'allInstalle'
    },
    idRemplacant: {
        type: Schema.Types.ObjectId,
        ref: 'allRemplacant'
    },
    idZonesGeo: {
        type: Schema.Types.ObjectId,
        ref: 'allZoneGeo'
    },
    idSite: {
        type: Schema.Types.ObjectId,
        ref: 'allSite'
    },
    evenements: [{
        title: String,
        valide: Boolean,
        occupe: Boolean,
        startsAt: String,
        endsAt: String,
        yesterday: String,
        tomorrow: String,
        remplacant: String,
        color: {
            primary: String,
            secondary: String
        },
        allDay: Boolean,
        calendarEventId: Number
    }]
}, {versionKey: false});

var AllEvenement = module.exports = mongoose.model('allEvenement', allEvenementSchema);