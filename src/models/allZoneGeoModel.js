var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var allZoneGeoSchema = new Schema({
    cercles: [{
        center: {
            latitude: Number,
            longitude: Number
        },
        radius: Number,
        stroke: {
            color: String,
            weight: Number,
            opacity: Number
        },
        fill: {
            color: String,
            opacity: Number
        },
        clickable: Boolean,
        editable : Boolean,
        draggable : Boolean
    }],
    idRemplacant: {
        type: Schema.Types.ObjectId,
        ref: 'allRemplacant'
    }
}, {versionKey: false});

var AllZoneGeo = module.exports = mongoose.model('allZoneGeo', allZoneGeoSchema);