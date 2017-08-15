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
  Url.findOne({short}, function (err, doc) {
    if (doc) {
      res.redirect(302, 'http://' + doc.long);

      if ( !req.query.testDate ) {
        currentDate = new Date();
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

app.get('/stats/:slug/:statsParam', function(req, res) {
  let short = req.params.slug;
  let statsQuery = req.params.statsParam;
  let stats = 0;
  let currentDate;
  let diff;
  const msToDays = 1000 * 60 * 60 * 24;
  
  Url.findOne({short}, function (err, doc) {
    if (doc) {

      if ( !req.query.testDate ) {
        currentDate = new Date();
      } else {
        currentDate = new Date(req.query.testDate);

      }
      let length = doc.lastSeven.length;
      if ( statsQuery === 'allTime' ) {
        stats = doc.allTime;
      } else if ( statsQuery === 'last24' ) {
        if ( length !== 0 ) {
          let lastDay = doc.lastSeven[length - 1];
          diff = (currentDate - lastDay.date) / msToDays;
          if ( diff <= 1 ) {
            stats = lastDay.count;
          }
        }
      } else if ( statsQuery === 'pastWeek' ) {
        for ( var index = 0; index < length; index++ ) {
          let day = doc.lastSeven[index];
          let date = day.date;
          diff = (currentDate - date) / msToDays;
          
          if ( diff <= 7) {
            stats += day.count;
          }
        }
      }
      res.status(200);
      res.send({ statsQuery, results: stats});

    } else {
      res.redirect(config.host);
    }
  });
});

app.listen(process.env.PORT || 4000);