# URL SHORTNER

A HTTP-based RESTful API for generating and managing Short URLs and redirectiong clients.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites



```
Node
MongoDB
```

### Installing

1 - Install MongoDb
```
brew update
brew install mongodb
```
2 - Fork and clone repo
```
git clone https://github.com/AWattNY/shortlyCF.git
```
3 - install package
```
$ npm install 
```
3 - Run
```
$ node app.js
```

## Running the tests

Open a seperate tab and run 
```
$ npm test
```
## testing API using curl

Create Short Url
```
$ curl -i -d "url=www.google.com" http://localhost:4000/api/shorten
```
Server will reply with the following JSON object
```
{"shortenedURL":"http://localhost:4000/r1JOuhlu-"}
```
## Built With
[ExpressJS](https://expressjs.com/)<br />
[Shortid](https://www.npmjs.com/package/supertest)<br />
[MochaJS](https://mochajs.org/)<br />
[Supertest](https://www.npmjs.com/package/supertest)


## Author
Adam Watt

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details


