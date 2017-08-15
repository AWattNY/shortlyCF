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

app.get('/:slug', function(req, res) {
  let short = req.params.slug;
  let currentDate;
  const msToDays = 1000 * 60 * 60 * 24;
  console.log('short: ', short);
  Url.findOne({short}, function (err, doc) {
    if (doc) {
      res.redirect(302, 'http://' + doc.long);
      console.log(req.query.testDate);
      if ( !req.query.testDate ) {
        currentDate = new Date();
        console.log(currentDate);
      } else {
        currentDate = new Date(req.query.testDate);

      }
      doc.allTime++;
      let length = doc.lastSeven.length;
      if ( length === 0 ) { 
        doc.lastSeven.push({ count: 1, date: currentDate});
      } else {
        
        length = doc.lastSeven.length;
        let lastDay = doc.lastSeven[length - 1];
        let lastDate = new Date(lastDay.date);
        let diff = ( currentDate - lastDate ) / msToDays;
        if ( diff > 1 ) {
          doc.lastSeven.push({ count: 1, date: currentDate});
        } else {
          console.log('i was here');
          lastDay.count++;
        }
        length = doc.lastSeven.length;
        if ( length > 7 ) {
          doc.lastSeven.shift();	
        } 
      } 

      doc.save(function(err) {
        if (err) {
          console.log(err);
        }
      });
      
    } else {
      res.redirect(config.host);
    }
  });
  
});



app.listen(process.env.PORT || 4000);