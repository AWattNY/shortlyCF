var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var urlSchema = new Schema({
  short: {type: String, required: true},
  long: String,
  allTime: {type: Number, default: 0},
  lastSeven: [{ count: Number, date: Date }],
  date: { type: Date, default: Date.now },
});

var UrlModel = mongoose.model('Url', urlSchema);

module.exports = UrlModel;