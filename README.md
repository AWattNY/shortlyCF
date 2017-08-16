# URL SHORTENER

A HTTP-based RESTful API for generating and managing Short URLs and redirecting clients with Basic Analytics.
For short URL creation we will use the [shortid](https://www.npmjs.com/package/shortid) npm module which creates short non-sequential (therfore not predictable) URL-friendly unique IDs. This package can generate any number of IDs without duplicates, even millions per day. For this use case, data being non-relational, persistence will require a high performance NoSQL database. While I will be using MongoDB for this implementation, for improved performance at scale Redis is definitely a good option as well. 

## API Description
### Shorten URL
  Returns JSON Data with shortened url.
* **URL**
  /api/shorten
* **Method:**
  `POST`
*  **Data Params**

   **Required:**
    `url=some Long url`
* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{"shortenedURL":"http://localhost:4000/r1JOuhlu-"}`
 
* **Sample Call:**
  See cURL section below
  
### Use Short URL
  Redirects user to appropriate Long Url.
* **URL**
  /:slug
* **Method:**
  `GET`
*  **URL Params** <br />
  **Required:** 
    `slug=[some Short Id]` <br />
  **Optional:** 
    `testDate=[date]` <br />
* **Success Response:**
  * **Code:** 302 <br />
    **Result:** Found. Redirecting to appropriate Long Url
* **Sample Call:**
  See cURL section below for examples

### Request Stats
  Returns Stats as per request params.
* **URL**
  /stats/:slug/:statsParam
* **Method:**
  `GET`
*  **URL Params** <br />
   **Required:** <br />
    `slug=[Alphanumeric ShortId]`<br />
    `statsParam=[allTime, pastWeek or last24]`<br />
   **Optional:** <br />
    `testDate=[date]`
* **Success Response:**
  * **Code:** 200 <br />
    **Content:** `{"statsQuery":"pastWeek","results":8}`
* **Sample Call:**
  See cURL section below for examples

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

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
2 - Fork and Clone this repo
```
git clone https://github.com/AWattNY/shortlyCF.git
```
3 - Install Project Dependencies
```
$ npm install 
```
4 - Run
```
$ npm start
```

## Running the tests

To run the automated Mocha/Supertest tests suite, open a seperate tab and run 
```
$ npm test
```
## Testing API using cURL

Create Short URL
```
$ curl -i -d "url=www.google.com" http://localhost:4000/api/shorten
```
Server will reply with a JSON Object
```
{"shortenedURL":"http://localhost:4000/r1JOuhlu-"}
```
Trying the same long URL twice returns a different short URL
```
$ curl -i -d "url=www.google.com" http://localhost:4000/api/shorten
```
Server will reply with a different short URL
```
{"shortenedURL":"http://localhost:4000/SkzUYhgOW"}
```
To use a Short URL
```
$ curl http://localhost:4000/SkzUYhgOW
```
Server reply 
```
Found. Redirecting to http://www.google.com
```
For testing purposes this get request also accepts a testDate query parameter<br />
For example to simulate the use of a short URL an hour later
```
curl http://localhost:4000/SkzUYhgOW?testDate=2017-08-15T19:15:46.778Z
```
Requesting short URL Access Stats from API:
Last 24 hours Stats
```
$ curl http://localhost:4000/stats/SkzUYhgOW/last24
```
Past Week Stats
```
$ curl http://localhost:4000/stats/SkzUYhgOW/pastWeek
```
All Time Stats
```
$ curl http://localhost:4000/stats/SkzUYhgOW/allTime
```
For testing purposes the stats route also accepts a testDate query parameter
```
$ curl http://localhost:4000/stats/SkzUYhgOW/last24?testDate=2017-08-17T18:00:02.534Z
```

## Built With
[ExpressJS](https://expressjs.com/)<br />
[Shortid](https://www.npmjs.com/package/supertest)<br />
[MochaJS](https://mochajs.org/)<br />
[Supertest](https://www.npmjs.com/package/supertest)

## To Do List
<ol>
<li> Implement Continuous Integration using Travis.</li>
<li> Implement Data Persistence with Redis.</li>
<li> Dockerize and deploy App.</li>
<li> Test App under High Traffic Load Conditions .</li>
<li> Test redirecting time is under 10ms.</li>
<li> Expand Test Coverage </li>
</ol>

## Author
Adam Watt

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details


