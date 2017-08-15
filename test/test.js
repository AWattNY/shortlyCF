var supertest = require('supertest');
var should = require('should');

var mongoose = require('mongoose');
var config = require('../config');

var Url = require('../urlModel');

mongoose.connect('mongodb://' + config.db.host + '/' + config.db.name, {
  useMongoClient: true,
});

var server = supertest.agent('http://localhost:4000');

describe('url shortning project unit tests', function() {

  it('a get request to homepage should respond with: Welcome to Shortly', function(done) {
    server
    .get('/')
    .expect('Content-type', /text/)
    .expect(200) // THis is HTTP response
    .end(function(err, res) {
      res.status.should.equal(200);
      res.text.should.equal('Welcome to Shortly');
      done();
    });
  });

  it('if a long url is added twice it should generate two different short urls ', function(done) {
    var body = { url: 'www.cloudFlare.com' };
    server
    .post('/api/shorten')
    .send(body)
    .end(function(err, res) {
      var short1 = res.body.shortenedURL.slice(22);
      
      server
      .post('/api/shorten')
      .send(body)
      .end(function(err, res) {
        var short2 = res.body.shortenedURL.slice(22);
        short2.should.not.equal(short1);
        done();
      
      });
      
      
    });
  });

  it('should persist short url to database ', function(done) {
    var body = { url: 'www.facebook.com' };
    server
    .post('/api/shorten')
    .send(body)
    .end(function(err, res) {
      var short = res.body.shortenedURL.slice(22);
      Url.findOne({short}, function (err, doc) {
          
      })
      .then(function(doc) {
        doc.long.should.equal(body.url);
      });
      done();
      
    });
  });

  it('should generate a short url and persist it to db and subsequent get should properly redirect to original long url', function(done) {
    var body = { url: 'www.google.com' };
    server
    .post('/api/shorten')
    .send(body)
    .end(function(err, res) {
      var short = res.body.shortenedURL.slice(22);
      
      server
      .get('/' + short)
      .expect('Location', body.url)
      .expect(302) 
      .end(function(err, res) {
        res.status.should.equal(302);
        res.redirect.should.equal(true);
        done();
      });
      
      
    });
  });

  it('should redirect a short url to a long url in under 10ms', function(done) {
    var body = { url: 'www.google.com' };
    var start = new Date();
    server
    .post('/api/shorten')
    .send(body)
    .end(function(err, res) {
      var end = new Date();
      var responseTime = end - start;
      responseTime.should.be.within(0, 10);
      done();
    });
  });

});

describe('url shortning project unit tests 2 - testing stats', function() {
  const msToDays = 1000 * 60 * 60 * 24;
  var date = new Date();
  var twoDaysLater = new Date();
  twoDaysLater.setDate(twoDaysLater.getDate() + 2);
  var tenDaysLater = new Date();
  tenDaysLater.setDate(tenDaysLater.getDate() + 10);
  
  before(function() {
    
    var newUrl = Url({
      long: 'www.uber.com',
      short: 'B1W2p3aJOb',
      allTime: 0,
      lastSeven: []
    });



    newUrl.save(function(err) {
      if (err) {
        console.log(err);
      }
    }); 

  });
  
  it('should return 0 for allTime after short url creation', function(done) {
    var body = { url: 'www.google.com' };
    server
    .post('/api/shorten')
    .send(body)
    .end(function(err, res) {
      var short = res.body.shortenedURL.slice(22);
      server
      .get('/stats/' + short + '/allTime')
      .end(function(err, res) {
        var body = res.body;
        body.should.have.property('results');
        body.should.have.property('statsQuery');
        body.statsQuery.should.equal('allTime');
        body.results.should.equal(0);
        done();
      });
      
    });  
  });

  it('should return 1 for allTime after short url first use for a testDate value within 24 hours', function(done) {
    var short = 'B1W2p3aJOb';
    server
    .get('/' + short)
    .end(function(err, res) {
      server
      .get('/stats/' + short + '/allTime')
      .end(function(err, res) {
        var body = res.body;
        body.should.have.property('results');
        body.should.have.property('statsQuery');
        body.statsQuery.should.equal('allTime');
        body.results.should.equal(1);
        done();
      }); 
    });
  });

  it('should return 1 for last24 after short url first use for a testDate value within 24 hours', function(done) {
    var short = 'B1W2p3aJOb';
    server
    .get('/stats/' + short + '/last24')
    .end(function(err, res) {
      var body = res.body;
      body.should.have.property('results');
      body.should.have.property('statsQuery');
      body.statsQuery.should.equal('last24');
      body.results.should.equal(1);
      done();
    }); 
    
  });

  it('should return 2 for allTime after short url first use for a testDate value 2days later', function(done) {
    var short = 'B1W2p3aJOb';
    
    server
    .get('/' + short + '?testDate=' + twoDaysLater)
    .end(function(err, res) {
      server
      .get('/stats/' + short + '/allTime')
      .end(function(err, res) {
        var body = res.body;
        body.should.have.property('results');
        body.should.have.property('statsQuery');
        body.statsQuery.should.equal('allTime');
        body.results.should.equal(2);
        done();
      }); 
    });
  });


  it('should return 2 for pastWeek after short url use for a testDate value 2 days later', function(done) {
    var short = 'B1W2p3aJOb';
    server
    .get('/stats/' + short + '/pastWeek' + '?testDate=' + twoDaysLater)
    .end(function(err, res) {
      var body = res.body;
      body.should.have.property('results');
      body.should.have.property('statsQuery');
      body.statsQuery.should.equal('pastWeek');
      body.results.should.equal(2);
      done();
    }); 
    
  });

  it('should return 1 for last24 after short url use for a testDate value 2 days later', function(done) {
    var short = 'B1W2p3aJOb';
    server
    .get('/stats/' + short + '/last24' + '?testDate=' + twoDaysLater)
    .end(function(err, res) {
      var body = res.body;
      body.should.have.property('results');
      body.should.have.property('statsQuery');
      body.statsQuery.should.equal('last24');
      body.results.should.equal(1);
      done();
    }); 
    
  });

  it('should return 3 for allTime after short url use for a testDate value 10 days later', function(done) {
    var short = 'B1W2p3aJOb';
    
    server
    .get('/' + short + '?testDate=' + tenDaysLater)
    .end(function(err, res) {
      server
      .get('/stats/' + short + '/allTime')
      .end(function(err, res) {
        var body = res.body;
        body.should.have.property('results');
        body.should.have.property('statsQuery');
        body.statsQuery.should.equal('allTime');
        body.results.should.equal(3);
        done();
      }); 
    });
  });

  it('should return 1 for last24 after short url use for a testDate value 10 days later', function(done) {
    var short = 'B1W2p3aJOb';
    server
    .get('/stats/' + short + '/last24' + '?testDate=' + tenDaysLater)
    .end(function(err, res) {
      var body = res.body;
      body.should.have.property('results');
      body.should.have.property('statsQuery');
      body.statsQuery.should.equal('last24');
      body.results.should.equal(1);
      done();
    }); 
    
  });

  it('should return 1 for pastWeek after short url use for a testDate value 10 days later', function(done) {
    var short = 'B1W2p3aJOb';
    server
    .get('/stats/' + short + '/pastWeek' + '?testDate=' + tenDaysLater)
    .end(function(err, res) {
      var body = res.body;
      body.should.have.property('results');
      body.should.have.property('statsQuery');
      body.statsQuery.should.equal('pastWeek');
      body.results.should.equal(1);
      done();
    }); 
    
  });

});

