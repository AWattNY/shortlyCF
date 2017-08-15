var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var slug = require('shortid');
var mongoose = require('mongoose');
var config = require('./config');

var Url = require('./urlModel');

mongoose.connect('mongodb://' + config.db.host + '/' + config.db.name, {
  useMongoClient: true,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', function(req, res) {
  res.send('Welcome to Shortly');
});


app.listen(process.env.PORT || 4000);