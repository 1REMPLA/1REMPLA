var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var evenementSchema = new Schema({
  idInstalle: {
    type: Schema.Types.ObjectId,
    ref: 'installe'
  },
  idRemplacant: {
    type: Schema.Types.ObjectId,
    ref: 'remplacant'
  },
  idZonesGeo: {
    type: Schema.Types.ObjectId,
    ref: 'zoneGeo'
  },
  idSite: {
    type: Schema.Types.ObjectId,
    ref: 'site'
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

var Evenement = module.exports = mongoose.model('evenement', evenementSchema);
