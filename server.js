// News Scrape Comment - please note this app does not work on Heroku. Some of the functions work locally. unable to complete assignment successfully. please use /scrape to start to scraping process

var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// scraping tools
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");

var PORT = 3000;
// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/newsart";
mongoose.connect(MONGODB_URI);


// Routes

// A GET route for scraping the website
app.get("/scrape", function(req, res) {
  axios.get("https://www.ablogtowatch.com/").then(function(response) {
    var $ = cheerio.load(response.data);

    $("div.post_text_inner").each(function(i, element) {
      var result = {};

      result.title = $(element).children('h2').children('a').text();
      result.excerpt = $(element).children('div.post_excerpt').text();
      result.link =$(element).children('h2').children('a').attr("href");


      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id })
    .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  db.Note.create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
