var mongoose = require("mongoose");


var Schema = mongoose.Schema;
var ArticleSchema = new Schema({
  title: {
    type: String,
    required: true
  },

  link: {
    type: String,
    required: true
  },

  excerpt: {
    type: String,
  },

  note: {
    type: Schema.Types.ObjectId,
    ref: "Notes"
  }
});

var Article = mongoose.model("Articles", ArticleSchema);

// Export the Article model
module.exports = Article;
