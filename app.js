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

app.post('/api/shorten', function(req, res) {
  let url = req.body.url;
  let newSlug = slug.generate();

  var newUrl = Url({
    long: url,
    short: newSlug
  });

  newUrl.save(function(err) {
    if (err) {
      console.log(err);
    }
  });
    
  res.send({ shortenedURL: `http://localhost:4000/${newSlug}` });
  
});





app.listen(process.env.PORT || 4000);